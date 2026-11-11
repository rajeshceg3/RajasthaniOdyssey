# Maru: six Rajasthan worlds

Six freely orbitable illustrations: Jaipur, Jodhpur, Jaisalmer, Udaipur, the Thar and Pushkar. Local 3D geometry and media, no API keys or paid services. This is an illustrated companion, not a measured reconstruction or navigation map.

Node22+, `npm ci`, `npm run dev`; `npm run build` produces `dist` for Cloudflare Pages. Production branch main, free GitHub-connected deployment. Inherited live URL retained unchanged: https://rajeshceg3.github.io/RajasthaniOdyssey/ . Original files and prose are preserved in `legacy/`; original media remains in `public/assets/`.

## Explore

Drag or arrow keys to orbit; pinch/scroll to zoom; Home or Reset view restores the composed camera. Motion animates water only, independently of sound. Reduced-motion preference starts paused. Sound starts off and only creates its audio context on opt-in. Six inherited local recordings play quietly; scene changes replace the recording. Sound off stops and unloads audio and closes its context. The Pushkar recording is from Deshnoke, explicitly labelled, not claimed as Pushkar field audio.

All18 landmark introductions remain, now with plain source-aware descriptions. The photo/story view preserves the six inherited photographs, but original photographer names were not recorded: photos are labelled unverified, not offered as landmark documentation. Reflections are new writing. Guide/credits includes the inherited pottery excerpt, explicitly from Assam rather than Rajasthan, with native video controls and no autoplay. Browser-local explored count persists. Original scroll timeline becomes a semantic six-place picker and Previous/Next, without swipe hijacking or a long intro.

## Sources and media

Official place background, checked November11 2026:
- https://www.tourism.rajasthan.gov.in/jaipur.html
- https://www.tourism.rajasthan.gov.in/jodhpur.html
- https://www.tourism.rajasthan.gov.in/jaisalmer.html
- https://www.tourism.rajasthan.gov.in/udaipur.html
- https://www.tourism.rajasthan.gov.in/pushkar.html

Full inherited credits and licence links: [public/asset-credits.md](public/asset-credits.md). Audio/video redistributed unchanged, including the inherited Thar and pottery excerpts. Their attribution and modifications are listed there and in the app's Guide & credits. Source files' original licences remain applicable.

## Executed verification

`npm test` uses WIDTH (default390) and optional CHROME. Six scenes × two UI themes × two motion settings =24 states per width. 320,390 and1440 local matrices pass. Tests cover real drag, arrow keys, Home/Reset, all18 introductions, photo loads, Guide & credits, modal Escape, local explored-count reload, no horizontal overflow, visible UI font floor14px and silent start. CI runs390/1440 on push and PR with build and high-severity audit.

Rendered UI contrast:614 visible text samples across44 screenshots, both themes at390/1440, minimum8.87:1 from glyph masks and their actual underlying backdrop. Scene geometry and photographic text are excluded. `verification/contrast.json` stores values; capture and measurement scripts are included. Pillow and numpy are needed for measurement.

Actual post-gain browser output from all six recordings was captured, four seconds each. Silent-before-opt-in, stop/unload/context-off and replay verified. Human listening remains unsigned; no listened-quality claim is made. Browser errors and UI matrices are recorded under ignored `verification/output/`; audio and contrast metadata are committed.
