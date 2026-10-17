# Directions and navigation

Routing uses the public FOSSGIS Valhalla endpoint (`https://valhalla1.openstreetmap.de/route`) and OpenStreetMap data. The endpoint is used by the [official demo](https://valhalla.openstreetmap.de/). It is a shared public service; for a production availability guarantee, replace it in `routing.js` with a managed or self-hosted Valhalla instance.

Each travel mode makes a separate request: `auto`, `bicycle`, or `pedestrian`. Paths, durations, distances, and instructions come from the provider; walking and cycling no longer reuse a driving path. Requests ask for two alternatives, preserving up to three distinct returned paths and sorting by estimated duration. The [API](https://valhalla.github.io/valhalla/api/route/api-reference/) may return fewer or no alternatives. Times are estimates without live traffic.

The UI offers selectable route cards and map lines. Selection updates the geometry, time, distance, and instructions together. Editing an endpoint clears old directions and aborts pending requests; a revision token prevents a late response restoring an obsolete route. Address suggestions search the local guide as you type; external address searches require Find or Enter. Starting location is explicitly selected by address, map point, or Use your location.

During navigation, GPS positions are projected onto route segments. Measuring to vertices alone caused false deviations on long straight roads. Positions with accuracy worse than 60 metres are withheld from tracking. Rerouting requires two consecutive positions outside the greater of 35 metres or 1.5 times GPS accuracy, with a 15-second cooldown. Reroutes retain the selected travel mode, and responses are discarded after navigation ends. Arrival requires proximity to the destination and the end of the route with GPS accuracy of 25 metres or better. Remaining ETA follows provider step durations; it is not a traffic prediction.

Remaining ETA uses the provider's durations of upcoming steps and the remaining fraction of the current step, rather than a single fixed speed across roads with different speeds.

Run `node --test tests/routing.test.js` for mode requests, geometry projection, route distances, alternative deduplication, provider timing preservation, remaining step durations, and failure handling. Browser checks cover local endpoints, mode switching, alternative selection, edited/pending requests, swap, and mobile layout. Live GPS behavior still needs a phone field test; browser preview and unit tests do not certify real-world positioning or OpenStreetMap coverage.
