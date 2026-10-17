const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function worker(fetch) {
    const handlers = {}, entries = new Map([['/app.js', new Response('cached app')], ['/index.html', new Response('cached page')]]);
    vm.runInNewContext(fs.readFileSync(require.resolve('../sw.js'), 'utf8'), {
        URL, Response, fetch,
        self: { location: { origin: 'https://example.test' }, addEventListener: (name, fn) => handlers[name] = fn },
        caches: { open: async () => ({ match: async key => entries.get(key), put: async (key, value) => entries.set(key, value) }) },
    });
    return request => {
        let result;
        handlers.fetch({ request: { method: 'GET', mode: 'cors', ...request }, respondWith: promise => result = promise });
        return result;
    };
}
test('versioned app assets use the release cache without waiting for the network', async () => {
    const get = worker(() => { throw new Error('should not fetch'); });
    assert.equal(await (await get({ url: 'https://example.test/app.js?v=11' })).text(), 'cached app');
    assert.equal(get({ url: 'https://example.test/api/suggestions' }), undefined);
    assert.equal(get({ url: 'https://route.example.test/route' }), undefined);
});
test('shared-place document navigation stays fresh and has an offline fallback', async () => {
    const fresh = worker(async () => new Response('fresh page'));
    const request = { url: 'https://example.test/index.html?loc=karls-kraut', mode: 'navigate' };
    assert.equal(await (await fresh(request)).text(), 'fresh page');
    const offline = worker(async () => { throw new Error('offline'); });
    assert.equal(await (await offline(request)).text(), 'cached page');
    assert.equal((await offline({ url: 'https://example.test/about.html', mode: 'navigate' })).status, 503);
});
