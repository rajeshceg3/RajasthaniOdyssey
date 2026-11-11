# Verify RajasthaniOdyssey
Maru - Six Rajasthan worlds: three.js desert experience (vite; puppeteer verification scripts).
## Launch
npm install, then npm run dev or npm run build && npm run preview.
## Doctor
`python3 .cursor/skills/verify-rajasthani-odyssey/verify.py`
## Drive
Builds with vite and renders the built app in headless Chromium asserting the boot marker and zero JS console errors.
## Evidence
`.cursor/skills/verify-rajasthani-odyssey/evidence.json`
## Cleanup
Static server terminated after the render.
## Known boundaries
Render smoke only; scene quality and e2e suites not exercised here.
