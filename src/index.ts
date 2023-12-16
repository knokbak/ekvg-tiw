/*
 * 
 */

import { HTML } from '../static';
import _DATA_ARR12_DEP30 from '../data/arr12-dep30.json';
import _DATA_ARR30_DEP12 from '../data/arr30-dep12.json';
import { TWIEntry, TWIResult } from './types';

const DATA_ARR12_DEP30 = _DATA_ARR12_DEP30.data as TWIEntry[];
const DATA_ARR30_DEP12 = _DATA_ARR30_DEP12.data as TWIEntry[];
const METAR_URL = 'https://aviationweather.gov/api/data/metar?ids=EKVG&format=json&taf=false';

export interface Env {

}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { method, url } = request;
		const { pathname } = new URL(url);

		if (method !== 'GET') {
			if (method === 'OPTIONS') {
				return new Response(null, {
					headers: {
						'Access-Control-Allow-Origin': 'https://twi.olli.ovh',
						'Access-Control-Allow-Methods': 'GET, OPTIONS',
					},
				});
			}
			return new Response('Method not allowed', { status: 405 });
		}

		switch (pathname) {
			case '/': {
				return new Response(HTML, {
					headers: {
						'Cache-Control': 'public, max-age=300',
						'Content-Type': 'text/html',
						'X-Frame-Options': 'DENY',
					},
				});
			}
			case '/api/status': {
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

				const windSkeidStr = rawOb.split(' WIND SKEID ')[1];
				if (!windSkeidStr) {
					console.error(windSkeidStr);
					return new Response('METAR is currently unavailable', { status: 500 });
				}

				const windSkeidDir = parseInt(windSkeidStr.substring(0, 3));
				const windSkeidSpeed = parseInt(windSkeidStr.substring(3, 5));
				let windSkeidGust = null;
				if (windSkeidStr[5] === 'G') {
					windSkeidGust = parseInt(windSkeidStr.substring(6, 8));
				}

				const windSkeidVariationStr = windSkeidStr.split(' ')[1];
				let variation: [number, number] | undefined = undefined;
				if (windSkeidVariationStr) {
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
						departing30: arr30Dep12,
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
						'Access-Control-Allow-Origin': 'https://twi.olli.ovh',
						'Content-Type': 'application/json',
						'Cache-Control': 'public, max-age=60',
					},
				});
			}
			default: {
				return new Response('Not found', { status: 404 });
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
			const currentResult = classifySpeed(dataset, current, speed);
			if (currentResult === 'severe') return 'severe';
			if (currentResult === 'heavy') result = 'heavy';
			if (currentResult === 'medium' && result !== 'heavy') result = 'medium';
			if (currentResult === 'light' && result === 'none') result = 'light';
		}

		return result;
	} else {
		if (severe && severe[0] <= speed) return 'severe';
		if (heavy && heavy[0] <= speed) return 'heavy';
		if (medium && medium[0] <= speed) return 'medium';
		if (light && light[0] <= speed) return 'light';
	}
	return 'none';
}
