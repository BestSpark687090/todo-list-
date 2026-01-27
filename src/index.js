/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { DurableObject } from 'cloudflare:workers';

export class TodoList extends DurableObject {
	constructor(ctx, env) {
		// Required, as we're extending the base class.
		super(ctx, env);
		this.sql = ctx.storage.sql;
		this.sql.exec(`
		CREATE TABLE IF NOT EXISTS tasks (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			completed BOOLEAN DEFAULT FALSE
		)`);
	}
	async getVals() {
		// const list = await this.ctx.list();
		// const results = await Promise.all(
		// 	list.keys.map(async (key) => ({
		// 		title: await env.KV.get(key.name),
		// 		id: key.name,
		// 	}))
		// );
		// // Return sorted numerically
		// return results.sort((a, b) => parseInt(a.id) - parseInt(b.id));
		let res = this.sql.exec('SELECT * FROM tasks;').toArray();
		console.log(res);
		return res;
	}
	async addValue(value) {
		this.sql.exec(`INSERT INTO tasks (title) VALUES (?);`, [value]);
		return await this.getVals();
	}
}
let latestid = 0;
async function getVals(env) {
	const list = await env.KV.list();
	const results = await Promise.all(
		list.keys.map(async (key) => ({
			title: await env.KV.get(key.name),
			id: key.name,
		}))
	);
	// Return sorted numerically
	return results.sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

export default {
	async fetch(request, env, ctx) {
		const stub = env.TODO_LIST.getByName('kv-tutorial_TodoList');
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			switch (request.method) {
				case 'GET':
					// const data = await getVals(env);
					// return new Response(JSON.stringify(data));
					return new Response(await stub.getVals());
				case 'POST':
					// const req_b = await request.json();
					// const currentData = await getVals(env);
					// const nextID = Date.now().toString();
					// await env.KV.put(nextID, req_b.title);
					// currentData.push({ title: req_b.title, id: nextID });
					// return new Response(JSON.stringify(currentData), {
					// 	headers: { 'Content-Type': 'application/json' },
					// });
					return new Response(await stub.addValue(request.json().title));
				case 'DELETE':
					const id = url.pathname.split('/').pop();
					if (!id) return new Response('Missing ID', { status: 400 });
					await env.KV.delete(id);
					return new Response(null, { status: 204 });

				default:
					return new Response('Method not allowed', { status: 405 });
			}
		}
		return env.ASSETS.fetch(request);
	},
};
/*export default {
  async fetch(request, env, ctx) {
    // write a key-value pair
    await env.KV.put('KEY', 'VALUE');

    // read a key-value pair
    const value = await env.KV.get('KEY');

    // list all key-value pairs
    const allKeys = await env.KV.list();

    // delete a key-value pair
    await env.KV.delete('KEY');

    // return a Workers response
    return new Response(
      JSON.stringify({
        value: value,
        allKeys: allKeys,
      }),
    );
  } 
} */
