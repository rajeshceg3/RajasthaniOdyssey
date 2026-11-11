// Render offline WAV previews of the Rajasthan soundscape, one per place.
// Output: /downloads/rajasthan-audio/<place>.wav (16-bit stereo 44.1 kHz, 45 s).
import { writeFileSync, mkdirSync } from 'node:fs';
import * as DSP from '../src/soundscape-dsp.js';
import { SOUND_PLACES } from '../src/sound-places.js';

const SR = 44100, SECONDS = 45, MASTER = 0.9;
const OUT = '/downloads/rajasthan-audio';
mkdirSync(OUT, { recursive: true });

const BEDS = { surf: DSP.renderSurfLoop, wind: DSP.renderWindLoop };
const VOICES = {
  koel: DSP.renderKoel, gull: DSP.renderGull, putter: DSP.renderPutter,
  bell: DSP.renderBell, camelBells: DSP.renderCamelBells, rickshawBell: DSP.renderRickshawBell,
  dove: DSP.renderDove, kite: DSP.renderKite, nightjar: DSP.renderNightjar,
};

function tile(loop, n) { const out = new Float32Array(n); for (let i = 0; i < n; i++) out[i] = loop[i % loop.length]; return out; }
function panGains(pan) { const a = (pan + 1) * Math.PI / 4; return [Math.cos(a), Math.sin(a)]; }

function writeWav(path, left, right, sr) {
  const n = left.length, data = n * 4;
  const buf = Buffer.alloc(44 + data);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + data, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(data, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i])) * 32767), 44 + i * 4 + 2);
  }
  writeFileSync(path, buf);
}

for (let p = 0; p < SOUND_PLACES.length; p++) {
  const place = SOUND_PLACES[p];
  const rng = DSP.makeRng(2000 + p);
  const n = SECONDS * SR;
  const L = new Float32Array(n), R = new Float32Array(n);
  for (const bed of place.beds) {
    const d = BEDS[bed.type](SR, bed.params, rng);
    const bL = tile(d.left, n), bR = tile(d.right, n);
    for (let i = 0; i < n; i++) { L[i] += bL[i] * bed.gain * MASTER; R[i] += bR[i] * bed.gain * MASTER; }
  }
  // Deterministic voice showcase: each of the place's voices appears once,
  // spread across the 45 s, so the preview demonstrates every layer.
  place.voices.forEach((v, k) => {
    const t = 4 + k * 14;
    const d = VOICES[v.kind](SR, rng);
    const [gl, gr] = panGains(k % 2 ? 0.4 : -0.4);
    const off = t * SR;
    for (let i = 0; i < d.length && off + i < n; i++) { L[off + i] += d[i] * v.gain * gl * MASTER; R[off + i] += d[i] * v.gain * gr * MASTER; }
  });
  const file = `${OUT}/rajasthan-${place.id}.wav`;
  writeFileSync(file, L, R, SR);
  console.log('wrote', file);
}
