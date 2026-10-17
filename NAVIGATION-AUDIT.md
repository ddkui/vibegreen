# Navigation and button audit

Reviewed on 3 October 2026. Browser checks used desktop and 390 × 844 layouts with public Luzern places. No real suggestion was submitted and no existing visit progress was reset.

| Area | Checks and changes |
| --- | --- |
| Main navigation | Home, Map, Learn, Directions and Menu share view state. Browser Back/Forward and direct goal links restore the correct screen. Home returns to the top immediately. About and Privacy have the same destination links. |
| Categories | All nine landing shortcuts and nine map filters return the expected counts. Sidebar categories are native keyboard-accessible buttons with pressed state. |
| Place cards | All three featured-place buttons open the matching place. Save toggles, saved-place reopening and restoring the initial saved state were checked. Visited toggles and Share copies a place URL. Descriptions stay in the card; duplicate popups and dormant carousel controls are removed. Mobile button hit targets were checked for overlaps. |
| Search | Local matches appear immediately. External address search uses Search or Enter. External results are keyboard-accessible, show the full address, and hide inapplicable Save/Visited actions and stale SDG badges. Response revisions prevent an old search replacing the latest query. |
| Directions | Place directions fill the destination and focus the starting-point field. No automatic location request. Each travel mode, real alternatives, keyboard route selection, swapping and clearing were checked. Miles formats real route lengths and step distances. Editing endpoints cancels stale results. |
| Settings and layers | Street/satellite selections and pressed states work. Keyboard focus stays in dialogs; Escape restores the previous screen. Reset shows an inline confirmation, keeps saved places/read lessons, and has an Undo action while the page remains open. Cancellation was tested; existing data was preserved. |
| Learning | All 17 goal tiles and all 17 lesson buttons open their matching goal. Place badges, keyboard completion and returning to the originating guide/map were checked. Hidden map/card controls cannot take focus through a lesson. Lessons use a vertical reading layout with current UN source links. Existing 2024 status passages remain dated background material. |
| Memory challenge | Missing timer controls restored. The optional game uses five places and a 90-second study period. Start, finish studying, recall submission (1 correct answer → 1/5), replay, intro close and leaving during study were checked. Timers and game markers are cleared on exit. |
| Suggestion form | Required-field validation, typing without triggering map shortcuts, Escape, close and form reset were checked. Backend availability errors keep the form available. Live submission was not exercised. |

Eight Node regression tests cover route profiles, genuine alternative handling, GPS projection, remaining time, supported view parsing and distance conversion. JavaScript syntax and Git whitespace checks pass.

Device GPS acquisition, live navigation, arrival detection and rerouting still need a phone field test. Public routing estimates have no live traffic and no availability guarantee. MapLibre can emit provider sprite warnings for some basemap POI icons; this does not block the guide's own place markers. Vector fallback has not been fault-injected. See `ROUTING.md` and `MAP-DESIGN.md` for providers and operating limits.
