import type { PlaybackCapabilities, SourceType } from "../domain/types";

// PlaybackCapabilities determination (see business-logic-model.md section 3).
// `youtubeAnalysisEnabled` reflects whether the user has opted into tab-audio capture for a
// YouTube source (see youtubePlayerAdapter.ts's enableAnalysisCapture) — ignored for other
// source types, which decide analysis support from sourceType alone.
export function capabilitiesFor(sourceType: SourceType, youtubeAnalysisEnabled = false): PlaybackCapabilities {
  if (sourceType === "local") {
    return {
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsChord: true,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "sample",
    };
  }
  if (sourceType === "youtube") {
    return {
      // EQ remains impossible even with analysis capture: changing what's heard would require
      // muting the original and substituting a processed copy, which just captures silence in
      // the same tab (see the project decision log).
      supportsEQ: false,
      supportsPitchDisplay: youtubeAnalysisEnabled,
      supportsWaveform: youtubeAnalysisEnabled,
      supportsChord: youtubeAnalysisEnabled,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "approximate",
    };
  }
  // "mic": raw audio is available (so EQ/pitch/waveform/chord work), but there is no transport to
  // control (no speed change, no loop) since the actual source plays on a separate device.
  return {
    supportsEQ: true,
    supportsPitchDisplay: true,
    supportsWaveform: true,
    supportsChord: true,
    supportsSpeedChange: false,
    supportsLoop: false,
    loopPrecision: "approximate",
  };
}
