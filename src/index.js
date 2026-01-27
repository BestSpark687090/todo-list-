/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
let latestID = 0;
async function getVals(env) {
	let list = await env.KV.list();
	let results = [];
	let i = 0;
	for (const key of list.keys) {
		results.push({ title: await env.KV.get(key.name), id: key.name });
		i++;
	}
	latestID = i--;
	results.sort(function (a, b) {
		return a.id - b.id;
	});
	return JSON.stringify(results);
}
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (url.pathname.startsWith('/api/')) {
			let body = '';
			// TODO: Add your custom /api/* logic here.
			switch (request.method) {
				case 'GET':
					body = await getVals(env);
					break;
				case 'POST':
					// body = 'hang on.';
					let req_b = await request.json();
					console.log(req_b);
					await env.KV.put(latestID, req_b.title);
					let j = { title: req_b.title, id: latestID.toString() };
					let json = JSON.parse(await getVals(env));
					json[latestID] = j;
					console.log(json);
					body = JSON.stringify(json);
					break;
				case 'DELETE':
					let id = parseInt(url.pathname.replace('/api/', ''));
					await env.KV.delete(id);
					break;
				default:
					return new Response('no.');
			}
			return new Response(body);
		}
		// Passes the incoming request through to the assets binding.
		// No asset matched this request, so this will evaluate `not_found_handling` behavior.
		return env.ASSETS.fetch(request);
		// // write a key-value pair
		// await env.KV.put('KEY', 'VALUE');

		// // read a key-value pair
		// const value = await env.KV.get('KEY');

		// // list all key-value pairs
		// const allKeys = await env.KV.list();

		// // delete a key-value pair
		// await env.KV.delete('KEY');

		// // return a Workers response
		// return new Response(
		// 	JSON.stringify({
		// 		value: value,
		// 		allKeys: allKeys,
		// 	})
		// );
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
