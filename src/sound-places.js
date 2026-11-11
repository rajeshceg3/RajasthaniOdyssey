// Rajasthan soundscape: one parameter set per place, matched to the land.
// Jaipur: rose-city breeze, doves in the haveli courtyards, a far rickshaw bell.
// Jodhpur: hard rampart wind and the black kites that circle Mehrangarh.
// Jaisalmer: dry desert wind with sand hiss, camel bells on the caravan road.
// Udaipur: Lake Pichola lapping, nightjar at dusk, doves.
// Thar: deep sparse desert wind, sand, a distant nightjar.
// Pushkar: ghat water, a far temple bell, doves. No voice, no melody, no words.
export const SOUND_PLACES = [
  { id: 'jaipur', beds: [{ type: 'wind', params: { baseCutoff: 620, wander: 250, gustRate: 0.08, gustDepth: 0.55 }, gain: 0.42 }], voices: [{ kind: 'dove', weight: 0.6, gain: 0.05 }, { kind: 'rickshawBell', weight: 0.4, gain: 0.035 }], voiceGap: [16, 40] },
  { id: 'jodhpur', beds: [{ type: 'wind', params: { baseCutoff: 460, wander: 320, gustRate: 0.09, gustDepth: 0.85 }, gain: 0.5 }], voices: [{ kind: 'kite', weight: 0.75, gain: 0.05 }, { kind: 'dove', weight: 0.25, gain: 0.045 }], voiceGap: [14, 36] },
  { id: 'jaisalmer', beds: [{ type: 'wind', params: { baseCutoff: 480, wander: 300, gustRate: 0.07, gustDepth: 0.9, sand: 0.5 }, gain: 0.5 }], voices: [{ kind: 'camelBells', weight: 0.5, gain: 0.04 }, { kind: 'kite', weight: 0.3, gain: 0.045 }, { kind: 'dove', weight: 0.2, gain: 0.04 }], voiceGap: [20, 50] },
  { id: 'udaipur', beds: [{ type: 'surf', params: { period: 3.4, lowpass: 1200, swash: 0.3, swashFreq: 950, power: 1.2 }, gain: 0.36 }, { type: 'wind', params: { baseCutoff: 500, gustRate: 0.06, gustDepth: 0.5 }, gain: 0.14 }], voices: [{ kind: 'nightjar', weight: 0.45, gain: 0.045 }, { kind: 'dove', weight: 0.55, gain: 0.05 }], voiceGap: [18, 44] },
  { id: 'thar', beds: [{ type: 'wind', params: { baseCutoff: 380, wander: 260, gustRate: 0.05, gustDepth: 0.9, sand: 0.35 }, gain: 0.44 }], voices: [{ kind: 'nightjar', weight: 0.65, gain: 0.04 }, { kind: 'camelBells', weight: 0.35, gain: 0.032 }], voiceGap: [30, 75] },
  { id: 'pushkar', beds: [{ type: 'surf', params: { period: 3, lowpass: 1100, swash: 0.3, swashFreq: 900, power: 1.2 }, gain: 0.4 }, { type: 'wind', params: { baseCutoff: 520, gustRate: 0.06, gustDepth: 0.5 }, gain: 0.15 }], voices: [{ kind: 'bell', weight: 0.4, gain: 0.05 }, { kind: 'dove', weight: 0.6, gain: 0.05 }], voiceGap: [24, 60] },
];
