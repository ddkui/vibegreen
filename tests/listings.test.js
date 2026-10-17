const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { places, categories } = vm.runInNewContext(fs.readFileSync(require.resolve('../data.js'), 'utf8') + ';({places:SUSTAINABLE_LOCATIONS,categories:CATEGORIES})');
test('every public pin has evidence, a review date, a valid category and regional placement', () => {
    assert.equal(new Set(places.map(place => place.id)).size, places.length);
    for (const place of places) {
        assert.ok(categories[place.category], place.id);
        assert.ok(place.lat > 46.9 && place.lat < 47.3 && place.lng > 8.05 && place.lng < 8.5, place.id);
        assert.ok(place.evidence.basis && /^\d{4}-\d{2}-\d{2}$/.test(place.evidence.reviewedAt), place.id);
        assert.ok(place.evidence.sources.length, place.id);
        for (const source of place.evidence.sources) assert.equal(new URL(source.url).protocol, 'https:');
        assert.ok(['building-address', 'square'].includes(place.coordinatePrecision), place.id);
    }
    for (const category of Object.keys(categories)) assert.ok(places.some(place => place.category === category), category);
});
test('the audit covers all original records and only sourced retained or added records are published', () => {
    const audit = JSON.parse(fs.readFileSync(require.resolve('../location-review.json'), 'utf8'));
    assert.equal(audit.entries.filter(entry => entry.decision !== 'added').length, audit.legacyCount);
    assert.equal(audit.publishedCount, places.length);
    assert.equal(new Set(audit.entries.map(entry => entry.id)).size, audit.entries.length);
    for (const entry of audit.entries) {
        assert.equal(places.some(place => place.id === entry.id), entry.decision !== 'withheld', entry.id);
    }
});
