(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.GreenNavigation = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';
    function parse(hash) {
        const value = hash.replace(/^#/, '');
        if (['home', 'map', 'learn', 'directions'].includes(value)) return { view: value };
        const goal = /^goal-(\d+)$/.exec(value);
        if (goal && +goal[1] >= 1 && +goal[1] <= 17) return { view: 'goal', goal: +goal[1] };
        return { view: 'home' };
    }
    function distance(meters, unit = 'metric') {
        if (unit === 'imperial') {
            const miles = meters / 1609.344;
            return miles >= .1 ? `${miles.toFixed(1)} mi` : `${Math.round(meters / .3048)} ft`;
        }
        return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
    }
    return { parse, distance };
});
