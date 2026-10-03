// Keep the large vector renderer out of the landing page's critical path.
(() => {
    let pending;
    const script = src => new Promise((resolve, reject) => {
        const element = document.createElement('script');
        element.src = src;
        const timeout = setTimeout(() => { element.remove(); reject(new Error('Map renderer timed out')); }, 8000);
        element.onload = () => { clearTimeout(timeout); resolve(); };
        element.onerror = () => { clearTimeout(timeout); reject(new Error('Map renderer unavailable')); };
        document.head.appendChild(element);
    });
    window.loadStreetRenderer = () => {
        if (pending) return pending;
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css';
        document.head.appendChild(css);
        pending = script('https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js')
            .then(() => script('https://unpkg.com/@maplibre/maplibre-gl-leaflet@0.1.3/leaflet-maplibre-gl.js'));
        return pending;
    };
})();
