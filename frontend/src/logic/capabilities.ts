import type { PlaybackCapabilities, SourceType } from "../domain/types";

// PlaybackCapabilities determination (see business-logic-model.md section 3)
export function capabilitiesFor(sourceType: SourceType): PlaybackCapabilities {
  if (sourceType === "local") {
    return {
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsSpeedChange: true,
      loopPrecision: "sample",
    };
  }
  return {
    supportsEQ: false,
    supportsPitchDisplay: false,
    supportsWaveform: false,
    supportsSpeedChange: true,
    loopPrecision: "approximate",
  };
}
