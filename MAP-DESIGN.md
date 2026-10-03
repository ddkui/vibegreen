# Map and motion choices

Reviewed 2 October 2026.

Green Luzern uses OpenFreeMap's Liberty vector style, rendered by MapLibre GL JS through the official Leaflet adapter. It replaces the visually dense OpenStreetMap Standard raster map with simpler land colors, clearer roads, and vector labels. The existing Leaflet place markers, filters, popups, and route overlays stay in place.

## Options researched

| Option | Fit for Green Luzern | Hosting considerations |
| --- | --- | --- |
| [MapLibre + OpenFreeMap](https://openfreemap.org/quick_start/) | Recommended. Liberty gives a familiar street-map appearance; styles can also be customized. | OpenFreeMap currently offers an open-source public instance without accounts, keys, or map-view limits. It has no SLA guarantee. Self-hosting is also supported. |
| [Protomaps](https://docs.protomaps.com/) | Good if we want ownership of regional tiles and more control over hosting. | Its open PMTiles format supports a regional extract stored on our own object storage. Storage, delivery, and data updates would become our responsibility. |
| [MapTiler streets](https://docs.maptiler.com/sdk-js/examples/switch-from-maplibre/) | A polished alternative built on an open-source rendering ecosystem. | Hosted maps require a MapTiler API key; hosted service terms and pricing are separate from open-source library licenses. |

Visual similarity to Google Maps is a design judgment. These maps use their own styling and data; they do not reproduce Google's proprietary tiles, POI coverage, traffic, or Street View.

## Integration

- Browser libraries are pinned to MapLibre GL JS 5.24.0 and `@maplibre/maplibre-gl-leaflet` 0.1.3, whose peer dependencies explicitly support MapLibre 5. This keeps the existing script-based app compatible without adding a bundler.
- Street style: `https://tiles.openfreemap.org/styles/liberty`.
- The vector layer displays OpenFreeMap, OpenMapTiles, and OpenStreetMap attribution through Leaflet's attribution control.
- Devices without WebGL2, unavailable vector scripts, map-loading errors, or a style-loading timeout use the Standard OpenStreetMap raster layer. Existing satellite imagery remains provided by Esri.
- Map layers initialize for the view being displayed. No offline tile archive or bulk prefetch is added.
- The [Leaflet adapter](https://github.com/maplibre/maplibre-gl-leaflet) preserves existing Leaflet behavior but does not offer MapLibre rotation, pitch, or its full direct-renderer performance. A complete MapLibre migration can be evaluated if those features become necessary.

## Landing motion

The headline arrives line by line, followed by the explanatory text and map preview. Lower sections reveal once as they enter the landing page's scrolling container. Hover arrows move a few pixels.

Motion uses CSS opacity and transform changes, plus IntersectionObserver for the lower sections. No perpetual background movement is added. `prefers-reduced-motion` disables entrance and reveal animation, including if the preference changes while the page is open. Content remains visible without the motion script.
