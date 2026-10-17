const test = require('node:test');
const assert = require('node:assert/strict');
const routing = require('../routing');

test('each travel mode asks for its own network and two alternatives', () => {
    for (const [mode, costing] of Object.entries({ driving: 'auto', cycling: 'bicycle', walking: 'pedestrian' })) {
        const request = routing.request({lat:47, lng:8}, {lat:48, lng:9}, mode);
        assert.equal(request.costing, costing);
        assert.equal(request.alternates, 2);
        assert.equal(request.shape_format, 'geojson');
        assert.deepEqual(request.locations, [{lat:47, lon:8}, {lat:48, lon:9}]);
    }
    assert.throws(() => routing.request({}, {}, 'flight'));
});
test('GPS midway along a long road is on route, not hundreds of metres away', () => {
    const match = routing.nearestOnRoute([[47,8],[47,8.02]], [47,8.01]);
    assert.ok(match.d < 0.1);
    assert.ok(Math.abs(match.fraction - 0.5) < 0.001);
    assert.ok(match.remaining > 750 && match.remaining < 770);
});
test('off-route distance is measured to the path and remaining distance follows bends', () => {
    const match = routing.nearestOnRoute([[47,8],[47,8.01],[47.01,8.01]], [47.0005,8.005]);
    assert.ok(match.d > 55 && match.d < 56);
    assert.ok(match.remaining > 1480 && match.remaining < 1510);
});
test('duplicate points and arrival do not produce NaN or remaining distance', () => {
    const match = routing.nearestOnRoute([[47,8],[47,8],[47,8.01]], [47,8.01]);
    assert.equal(match.d, 0);
    assert.equal(match.remaining, 0);
});
test('remaining ETA uses the durations of upcoming steps rather than one fixed speed', () => {
    const steps = [{distance:1000,duration:100},{distance:1000,duration:1000},{distance:0,duration:0}];
    assert.equal(routing.remainingTime(steps, 0, 500), 1050);
    assert.equal(routing.remainingTime(steps, 1, 500), 500);
    assert.equal(routing.remainingTime(steps, 2, 0), 0);
});
test('provider times are preserved and genuine alternatives sorted/deduplicated', async () => {
    const original = global.fetch;
    const route = (duration, end) => ({ duration, distance: 1500, geometry: { coordinates:[[8,47],[end,47]] }, legs:[] });
    const slow = route(150,8.02), fast = route(90,8.01);
    try {
        let requested;
        global.fetch = async (url, options) => {
            requested = { url, options };
            return { ok:true, json:async () => ({ code:'Ok', routes:[slow, fast, fast] }) };
        };
        const controller = new AbortController();
        const routes = await routing.fetchRoutes({lat:47,lng:8}, {lat:47,lng:8.02}, 'walking', controller.signal);
        assert.equal(routes.length, 2);
        assert.equal(routes[0].duration, 90);
        assert.equal(routes[1].duration, 150);
        assert.equal(requested.options.signal, controller.signal);
        assert.equal(JSON.parse(new URL(requested.url).searchParams.get('json')).costing, 'pedestrian');
        global.fetch = async () => ({ ok:true, json:async () => ({code:'NoRoute',routes:[]}) });
        await assert.rejects(routing.fetchRoutes({}, {}, 'walking'), /No route/);
        global.fetch = async () => ({ok:false});
        await assert.rejects(routing.fetchRoutes({}, {}, 'cycling'), /unavailable/);
    } finally { global.fetch = original; }
});
