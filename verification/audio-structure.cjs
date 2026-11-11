// Structural audio verification for the Rajasthan soundscape. Measurable
// properties only; no aesthetic judgment (that stays with a human listener).
(async () => {
const DSP = await import('../src/soundscape-dsp.js');
const { SOUND_PLACES } = await import('../src/sound-places.js');
const fs = require('fs');
const SR = 44100, MASTER = 0.9;
const BEDS = { surf: DSP.renderSurfLoop, wind: DSP.renderWindLoop };
const VOICES = { koel: DSP.renderKoel, gull: DSP.renderGull, putter: DSP.renderPutter, bell: DSP.renderBell, camelBells: DSP.renderCamelBells, rickshawBell: DSP.renderRickshawBell, dove: DSP.renderDove, kite: DSP.renderKite, nightjar: DSP.renderNightjar };
const failures = [];
const check = (name, ok, detail) => { console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' (' + detail + ')' : '')); if (!ok) failures.push(name); };
function stats(a) { let peak = 0, sum = 0, dc = 0; for (let i = 0; i < a.length; i++) { const v = Math.abs(a[i]); if (v > peak) peak = v; sum += a[i] * a[i]; dc += a[i]; } return { peak, rms: Math.sqrt(sum / a.length), dc: dc / a.length }; }
function seamMetric(loop) {
  // A real seam defect shows as a step far beyond the signal's own extreme
  // steps, or as a level jump across the wrap. Ordinary noise steps near the
  // wrap are expected, so compare against dense p99 and local RMS.
  const n = loop.length;
  let wrapMax = 0;
  for (let i = n - 25; i < n + 25; i++) wrapMax = Math.max(wrapMax, Math.abs(loop[i % n] - loop[(i + 1) % n]));
  const steps = [];
  for (let i = 0; i < n - 1; i++) steps.push(Math.abs(loop[i] - loop[i + 1]));
  steps.sort((a, b) => a - b);
  const p99 = steps[Math.floor(steps.length * 0.99)];
  const W = Math.floor(0.05 * 44100); // 50 ms
  let pre = 0, post = 0;
  for (let i = 0; i < W; i++) { pre += loop[n - 1 - i] * loop[n - 1 - i]; post += loop[i] * loop[i]; }
  const rmsRatio = Math.sqrt(post / W) / (Math.sqrt(pre / W) || 1e-9);
  return { wrapMax, p99, rmsRatio };
}
const report = { sr: SR, places: {}, voices: {}, limits: 'structural only; no aesthetic judgment' };
for (let p = 0; p < SOUND_PLACES.length; p++) {
  const place = SOUND_PLACES[p];
  const rng = DSP.makeRng(2000 + p);
  let refLen = 0;
  const beds = place.beds.map(bed => { const d = BEDS[bed.type](SR, bed.params, rng); refLen = Math.max(refLen, d.left.length); return { d, gain: bed.gain }; });
  const n = refLen, mix = new Float32Array(n);
  for (const { d, gain } of beds) { const m = d.left.length; for (let i = 0; i < n; i++) { const j = i % m; mix[i] += ((d.left[j] + d.right[j]) / 2) * gain * MASTER; } }
  const s = stats(mix), db = 20 * Math.log10(s.rms || 1e-9);
  check(place.id + ' no clipping', s.peak <= 0.98, 'peak ' + s.peak.toFixed(3));
  check(place.id + ' loudness in quiet-ambient band', db > -30 && db < -14, db.toFixed(1) + ' dBFS RMS');
  check(place.id + ' no DC offset', Math.abs(s.dc) < 0.01, 'dc ' + s.dc.toExponential(1));
  for (const { d } of beds) {
    const sl = seamMetric(d.left), sr2 = seamMetric(d.right);
    check(place.id + ' bed seam L', sl.wrapMax <= sl.p99 * 3 && sl.rmsRatio > 0.4 && sl.rmsRatio < 2.5, 'wrap ' + sl.wrapMax.toFixed(4) + ' vs p99 ' + sl.p99.toFixed(4) + ', rms ratio ' + sl.rmsRatio.toFixed(2));
    check(place.id + ' bed seam R', sr2.wrapMax <= sr2.p99 * 3 && sr2.rmsRatio > 0.4 && sr2.rmsRatio < 2.5, 'wrap ' + sr2.wrapMax.toFixed(4) + ' vs p99 ' + sr2.p99.toFixed(4) + ', rms ratio ' + sr2.rmsRatio.toFixed(2));
  }
  report.places[place.id] = { peak: +s.peak.toFixed(3), rmsDb: +db.toFixed(1) };
  for (const v of place.voices) {
    const d = VOICES[v.kind](SR, rng);
    const sv = stats(d);
    check(place.id + ' voice ' + v.kind + ' renders', d.length > SR * 0.5 && sv.peak <= 0.98 && sv.rms > 0.0005, 'dur ' + (d.length / SR).toFixed(2) + 's peak ' + sv.peak.toFixed(2));
    report.voices[place.id + ':' + v.kind] = { durS: +(d.length / SR).toFixed(2), peak: +sv.peak.toFixed(2) };
  }
}
fs.mkdirSync('verification/output', { recursive: true });
fs.writeFileSync('verification/output/audio-structure.json', JSON.stringify(report, null, 2));
if (failures.length) { console.error('AUDIO STRUCTURE FAILURES:', failures.join('; ')); process.exit(1); }
console.log('PASS audio-structure: beds seamless, no clipping, quiet-ambient loudness, no DC. Not a listening judgment.');
})();
