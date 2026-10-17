(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.GreenRouting = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
    const profiles = { driving: 'auto', cycling: 'bicycle', walking: 'pedestrian' };
    const endpoint = 'https://valhalla1.openstreetmap.de/route';
    function request(origin, destination, mode, alternatives = 2) {
        if (!profiles[mode]) throw new Error('Unknown travel mode');
        return { locations: [origin, destination].map(p => ({ lat: p.lat, lon: p.lng })),
            costing: profiles[mode], alternates: alternatives, format: 'osrm', shape_format: 'geojson',
            units: 'kilometers', language: 'en-GB' };
    }
    async function fetchRoutes(origin, destination, mode, signal, alternatives = 2) {
        const response = await fetch(`${endpoint}?json=${encodeURIComponent(JSON.stringify(request(origin, destination, mode, alternatives)))}`, { signal });
        if (!response.ok) throw new Error('Routing service unavailable');
        const data = await response.json();
        if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route found for this travel mode');
        const unique = new Map();
        data.routes.forEach(route => {
            if (route.geometry?.coordinates?.length < 2 || !route.geometry?.coordinates || !Number.isFinite(route.duration) || !Number.isFinite(route.distance)) return;
            const key = JSON.stringify(route.geometry.coordinates);
            if (!unique.has(key)) unique.set(key, route);
        });
        const routes = [...unique.values()].sort((a, b) => a.duration - b.duration);
        if (!routes.length) throw new Error('No usable route returned');
        return routes;
    }
    function distance(a, b) {
        const rad = Math.PI / 180;
        const h = Math.sin((b[0] - a[0]) * rad / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin((b[1] - a[1]) * rad / 2) ** 2;
        return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
    }
    // Project onto segments, rather than treating a long straight road as isolated vertices.
    function nearestOnRoute(coords, position) {
        let best = { idx: 0, fraction: 0, d: Infinity, point: coords[0], remaining: 0 };
        const scale = Math.cos(position[0] * Math.PI / 180);
        for (let i = 0; i < coords.length - 1; i++) {
            const a = coords[i], b = coords[i + 1];
            const dx = (b[1] - a[1]) * scale, dy = b[0] - a[0];
            const denominator = dx * dx + dy * dy;
            const fraction = denominator ? Math.max(0, Math.min(1, (((position[1] - a[1]) * scale) * dx + (position[0] - a[0]) * dy) / denominator)) : 0;
            const point = [a[0] + fraction * dy, a[1] + fraction * (b[1] - a[1])];
            const d = distance(point, position);
            if (d < best.d) best = { idx: i, fraction, d, point };
        }
        best.remaining = distance(best.point, coords[best.idx + 1] || best.point);
        for (let i = best.idx + 1; i < coords.length - 1; i++) best.remaining += distance(coords[i], coords[i + 1]);
        return best;
    }
    function remainingTime(steps, stepIndex, remainingInStep) {
        const current = steps[stepIndex];
        if (!current) return 0;
        const fraction = current.distance > 0 ? Math.max(0, Math.min(1, remainingInStep / current.distance)) : 0;
        return current.duration * fraction + steps.slice(stepIndex + 1).reduce((total, step) => total + step.duration, 0);
    }
    return { request, fetchRoutes, nearestOnRoute, distance, remainingTime };
});
