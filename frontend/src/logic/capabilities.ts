import type { PlaybackCapabilities, SourceType } from "../domain/types";

// PlaybackCapabilities determination (see business-logic-model.md section 3)
export function capabilitiesFor(sourceType: SourceType): PlaybackCapabilities {
  if (sourceType === "local") {
    return {
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "sample",
    };
  }
  if (sourceType === "youtube") {
    return {
      supportsEQ: false,
      supportsPitchDisplay: false,
      supportsWaveform: false,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "approximate",
    };
  }
  // "mic": raw audio is available (so EQ/pitch/waveform work), but there is no transport to
  // control (no speed change, no loop) since the actual source plays on a separate device.
  return {
    supportsEQ: true,
    supportsPitchDisplay: true,
    supportsWaveform: true,
    supportsSpeedChange: false,
    supportsLoop: false,
    loopPrecision: "approximate",
  };
}
