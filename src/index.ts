/*
 * BSD 3-Clause License
 * Copyright (c) 2023, Ollie Killean
 * 
 * If a copy of the BSD 3-Clause License was not distributed with this file, you
 * may obtain one at: https://github.com/knokbak/ekvg-twi/blob/master/LICENSE.
 */

import { HTML } from '../static';
import _DATA_ARR12_DEP30 from '../data/arr12-dep30.json';
import _DATA_ARR30_DEP12 from '../data/arr30-dep12.json';
import { TWIEntry, TWIResult } from './types';

const DATA_ARR12_DEP30 = _DATA_ARR12_DEP30.data as TWIEntry[];
const DATA_ARR30_DEP12 = _DATA_ARR30_DEP12.data as TWIEntry[];
const METAR_URL = 'https://aviationweather.gov/api/data/metar?ids=EKVG&format=json&taf=false';
const HEADERS = {
	'Access-Control-Allow-Origin': 'https://twi.olli.ovh',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Cross-Origin-Resource-Policy': 'same-origin',
	'Content-Security-Policy': 'default-src \'none\'; script-src https://cdn.olli.ovh https://static.cloudflareinsights.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src https://cdn.olli.ovh https://fonts.googleapis.com; img-src https://cdn.olli.ovh; font-src https://fonts.gstatic.com; connect-src \'self\'; frame-ancestors \'none\'; upgrade-insecure-requests; block-all-mixed-content; disown-opener',
	'X-Frame-Options': 'DENY',
};

// these are to compensate for the weirdness provided by sims....
const ALLOWANCES = {
	light: 0,
	medium: 0,
	heavy: 3,
	severe: 5,
};

export interface Env {
	TURNSTILE_SECRET: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { method, url } = request;
		const { pathname } = new URL(url);

		if (method !== 'GET') {
			if (method === 'OPTIONS') {
				return new Response(null, {
					headers: HEADERS,
				});
			}
			return new Response('Method not allowed', { status: 405 });
		}

		switch (pathname) {
			case '/': {
				return new Response(HTML, {
					headers: {
						...HEADERS,
						'Cache-Control': 'public, max-age=300',
						'Content-Type': 'text/html',
						'Link': '<https://twi.olli.ovh/api/status>; rel="prefetch", <https://fonts.gstatic.com>; rel="preconnect", <https://fonts.googleapis.com>; rel="preconnect", <https://cdn.olli.ovh/twi.olli.ovh/styles/main.css>; rel="prefetch"; as="style", <https://cdn.olli.ovh/twi.olli.ovh/scripts/main.js>; rel="prefetch"; as="script", <https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit>; rel="prefetch"; as="script"',
						'Referrer-Policy': 'same-origin',
					},
				});
			}
			case '/api/status': {
				const turnstileToken = request.headers.get('x-turnstile-pass');
				if (!turnstileToken) {
					return new Response('Missing Turnstile token', { status: 401 });
				}

				const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
					method: 'POST',
					headers: {
						'User-Agent': 'twi.olli.ovh',
						'Content-Type': 'application/json; charset=UTF-8',
						'Accept': 'application/json',
					},
					body: JSON.stringify({
						secret: env.TURNSTILE_SECRET,
						response: turnstileToken,
						remoteip: request.headers.get('cf-connecting-ip'),
					}),
				}).then(res => res.json()) as any;

				if (!turnstileResponse.success) {
					return new Response('Invalid Turnstile token', { status: 403 });
				}

				let hasUsedCache = false;
				const cache = await caches.open('twi');
				let metar: any = await cache.match(METAR_URL);
				if (!metar) {
					metar = await fetch(METAR_URL, {
						method: 'GET',
						headers: {
							'User-Agent': 'twi.olli.ovh',
						},
					}).then(res => res.json()) as any[];
	
					const cache = await caches.open('twi');
					await cache.put(METAR_URL, new Response(JSON.stringify(metar), {
						headers: {
							'Content-Type': 'application/json',
							'Cache-Control': 'public, max-age=180',
						},
					}));
				} else {
					hasUsedCache = true;
					metar = await metar.json() as any[];
				}
				const { receiptTime, wdir, wspd, wgst, rawOb } = metar[0];
				console.log(`cached = ${hasUsedCache}`, metar);

				const windSkeidStr = rawOb.split(' WIND SKEID ')[1];
				if (!windSkeidStr) {
					console.error(windSkeidStr);
					return new Response('METAR is currently unavailable', { status: 500 });
				}

				let windSkeidDir = 0;
				if (windSkeidStr.startsWith('VRB')) {
					windSkeidDir = isNaN(wdir) ? 210 : wdir;
				} else {
					windSkeidDir = parseInt(windSkeidStr.substring(0, 3));
				}

				const windSkeidSpeed = parseInt(windSkeidStr.substring(3, 5));
				let windSkeidGust = null;
				if (windSkeidStr[5] === 'G') {
					windSkeidGust = parseInt(windSkeidStr.substring(6, 8));
				}

				const windSkeidVariationStr = windSkeidStr.split(' ')[1];
				let variation: [number, number] | undefined = undefined;
				if (windSkeidVariationStr && windSkeidVariationStr.includes('V')) {
					const [start, end] = windSkeidVariationStr.split('V');
					variation = [parseInt(start), parseInt(end)];
					if (isNaN(variation[0]) || isNaN(variation[1])) {
						variation = undefined;
					}
				}

				const arr12Dep30 = classifySpeed(DATA_ARR12_DEP30, windSkeidDir, windSkeidGust ?? windSkeidSpeed, variation);
				const arr30Dep12 = classifySpeed(DATA_ARR30_DEP12, windSkeidDir, windSkeidGust ?? windSkeidSpeed, variation);

				return new Response(JSON.stringify({
					at: receiptTime,
					warnings: {
						arriving12: arr12Dep30,
						departing12: arr30Dep12,
						arriving30: arr30Dep12,
						departing30: arr12Dep30,
					},
					winds: {
						direction: wdir,
						speed: wspd,
						gust: wgst,
					},
					skeid: {
						direction: windSkeidDir,
						speed: windSkeidSpeed,
						gust: windSkeidGust,
					},
					raw: {
						metar: rawOb,
						metarSource: METAR_URL,
						fromCache: hasUsedCache,
					}
				}), {
					headers: {
						...HEADERS,
						'Cache-Control': 'public, max-age=60',
						'Content-Type': 'application/json',
					},
				});
			}
			default: {
				return new Response('Not found', {
					status: 404,
					headers: {
						...HEADERS,
						'Cache-Control': 'public, max-age=30',
					},
				});
			}
		}
	},
};

function classifySpeed (dataset: TWIEntry[], degrees: number, speed: number, variation?: [number, number]): TWIResult {
	const index = Math.round(degrees / 10) % 36;
	const entry = dataset[index];
	const { light, medium, heavy, severe } = entry;

	if (variation) {
		// if there is variation, we need to check every 10 degrees from the start to the end and use the highest result
		const [start, end] = variation;
		const difference = Math.min(Math.abs(start - end), Math.abs((Math.max(...variation) - 360) - Math.min(...variation)));
		let result: TWIResult = 'none';

		for (let i = 0; i <= difference; i += 10) {
			const current = (start + i) % 360;
			const fromCenter = Math.min(Math.abs(degrees - current), Math.abs((Math.max(degrees, current) - 360) - Math.min(degrees, current)));
			const currentSpeed = speed - ((fromCenter / 10) * 2);
			const currentResult = classifySpeed(dataset, current, currentSpeed);
			if (currentResult === 'severe') return 'severe';
			if (currentResult === 'heavy') result = 'heavy';
			if (currentResult === 'medium' && result !== 'heavy') result = 'medium';
			if (currentResult === 'light' && result === 'none') result = 'light';
		}

		return result;
	} else {
		if (severe && severe[0] + ALLOWANCES.severe <= speed) return 'severe';
		if (heavy && heavy[0] + ALLOWANCES.heavy <= speed) return 'heavy';
		if (medium && medium[0] + ALLOWANCES.medium <= speed) return 'medium';
		if (light && light[0] + ALLOWANCES.light <= speed) return 'light';
	}
	return 'none';
}
