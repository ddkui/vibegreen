# Loading and responsive checks — 4 October 2026

The landing page defers its application scripts. MapLibre and its Leaflet adapter load only when the detailed map opens; the landing preview uses raster tiles and requests them when its section approaches the visible area. SDG images load lazily. Confetti and the downloaded monospace font were removed, and icons load only their regular and bold weights. The artificial 150 ms loading delay is removed.

About and Privacy share a small page reset instead of loading the full map/application stylesheet. The release service worker serves app assets from cache without waiting for the network; HTML remains network-first with an offline fallback. Routing and external API requests are not intercepted. Bump the release cache name when shipping changed assets.

The map breakpoint now consistently switches at 768 px. Route fields use 16 px text on mobile, bottom navigation clears the place and route controls, and short landscape screens retain scrolling panels.

Browser checks covered 320 × 568, 390 × 844, 768 × 1024, 844 × 390 and the default 1280 × 720 viewport. Home, About and Privacy have no horizontal document overflow on the small phone; place evidence and actions are visible at 390 px. The tablet route panel clears its bottom navigation. A fresh Home document contains no MapLibre script; opening Map loads the vector renderer. Goal 11 opens with Enter. Karls Kraut to HERMITAGE returns two driving alternatives using corrected building pins. Withheld shared-place links display an explanation.

All 12 Node regression tests pass, covering release-cache behavior, listing evidence/audit integrity, navigation and routing calculations. JavaScript syntax and Git whitespace checks pass. These checks establish loading behavior and usable layouts, not a measured Lighthouse score or a real-device GPS field test.

See LOCATION-REVIEW.md for the 32 public listings and the review decisions for the 75 legacy records; the earlier NAVIGATION-AUDIT.md records the preceding button audit.
