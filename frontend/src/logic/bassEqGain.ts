// BassEQProcessor gain mapping (see business-logic-model.md section 4, business-rules.md)

export const EQ_MIN_GAIN_DB = -12;
export const EQ_MAX_GAIN_DB = 12;
export const EQ_CENTER_FREQUENCY_HZ = 100; // within the 40-250Hz bass band

export function clampGainDb(gainDb: number): number {
  return Math.min(EQ_MAX_GAIN_DB, Math.max(EQ_MIN_GAIN_DB, gainDb));
}

// NOTE: BiquadFilterNode's own `gain` AudioParam is specified directly in dB for
// lowshelf/peaking filters, so LocalAudioEngine assigns `clampGainDb(gainDb)` to it as-is —
// this linear conversion is NOT used for that wiring. It exists as a separately testable,
// decibel-to-linear-ratio utility (e.g. for level metering) with the same identity/monotonic
// properties, verified below.
export function gainDbToLinearGain(gainDb: number): number {
  const clamped = clampGainDb(gainDb);
  return Math.pow(10, clamped / 20);
}
