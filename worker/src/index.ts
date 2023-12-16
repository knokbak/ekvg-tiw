/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import DATA_ARR12_DEP30 from '../../data/arr12-dep30.json';
import DATA_ARR30_DEP12 from '../../data/arr30-dep12.json';
import { TWIEntry, TWIResult } from './types';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
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
			case '/api/status': {
				const metar = await fetch('https://aviationweather.gov/api/data/metar?ids=EKVG&format=json&taf=false', {
					method: 'GET',
					headers: {
						'User-Agent': 'twi.olli.ovh',
					},
				}).then((res) => res.json()) as any[];

				const { wdir, wspd, wgst } = metar[0];
				const index = Math.round(wdir / 10) % 36;

				const arr12Dep30 = classifySpeed(DATA_ARR12_DEP30[index] as TWIEntry);
				const arr30Dep12 = classifySpeed(DATA_ARR30_DEP12[index] as TWIEntry);

				return new Response(JSON.stringify({
					direction: wdir,
					speed: wspd,
					gust: wgst,
					arr12Dep30,
					arr30Dep12,
				}), {
					headers: {
						'Access-Control-Allow-Origin': 'https://twi.olli.ovh',
					},
				});
			}
			default: {
				return new Response('Not found', { status: 404 });
			}
		}
	},
};

function classifySpeed (entry: TWIEntry): TWIResult {
	const { light, medium, heavy, severe } = entry;
	if (severe && severe[0] > 0) return 'severe';
	if (heavy && heavy[0] > 0) return 'heavy';
	if (medium && medium[0] > 0) return 'medium';
	if (light && light[0] > 0) return 'light';
	return 'none';
}
