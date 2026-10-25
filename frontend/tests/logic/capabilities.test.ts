import { describe, expect, it } from "vitest";
import { capabilitiesFor } from "../../src/logic/capabilities";

describe("capabilitiesFor (example-based, PBT-10 pairing)", () => {
  it("grants full capabilities for local sources", () => {
    expect(capabilitiesFor("local")).toEqual({
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "sample",
    });
  });

  it("grants only speed change + approximate loop for YouTube sources", () => {
    expect(capabilitiesFor("youtube")).toEqual({
      supportsEQ: false,
      supportsPitchDisplay: false,
      supportsWaveform: false,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "approximate",
    });
  });

  it("grants EQ/pitch/waveform but no transport control for mic input", () => {
    expect(capabilitiesFor("mic")).toEqual({
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsSpeedChange: false,
      supportsLoop: false,
      loopPrecision: "approximate",
    });
  });
});
