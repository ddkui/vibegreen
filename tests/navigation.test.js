const test = require('node:test');
const assert = require('node:assert/strict');
const { parse, distance } = require('../navigation');

test('navigation accepts only supported views and all seventeen goals', () => {
    for (const view of ['home', 'map', 'learn', 'directions']) assert.deepEqual(parse('#' + view), { view });
    for (let goal = 1; goal <= 17; goal++) assert.deepEqual(parse('#goal-' + goal), { view: 'goal', goal });
    for (const hash of ['', '#goal-0', '#goal-18', '#goal-3junk', '#settings']) assert.deepEqual(parse(hash), { view: 'home' });
});
test('distances convert native route meters to metric or imperial', () => {
    assert.equal(distance(120), '120 m');
    assert.equal(distance(5900), '5.9 km');
    assert.equal(distance(1609.344, 'imperial'), '1.0 mi');
    assert.equal(distance(30.48, 'imperial'), '100 ft');
    assert.equal(distance(5900, 'imperial'), '3.7 mi');
});
