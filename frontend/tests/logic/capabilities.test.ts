import { describe, expect, it } from "vitest";
import { capabilitiesFor } from "../../src/logic/capabilities";

describe("capabilitiesFor (example-based, PBT-10 pairing)", () => {
  it("grants full capabilities for local sources", () => {
    expect(capabilitiesFor("local")).toEqual({
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsChord: true,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "sample",
    });
  });

  it("grants only speed change + approximate loop for YouTube sources by default (no tab-audio capture yet)", () => {
    expect(capabilitiesFor("youtube")).toEqual({
      supportsEQ: false,
      supportsPitchDisplay: false,
      supportsWaveform: false,
      supportsChord: false,
      supportsSpeedChange: true,
      supportsLoop: true,
      loopPrecision: "approximate",
    });
  });

  it("grants pitch/waveform/chord (but never EQ) for YouTube once tab-audio capture is enabled", () => {
    const caps = capabilitiesFor("youtube", true);
    expect(caps.supportsEQ).toBe(false);
    expect(caps.supportsPitchDisplay).toBe(true);
    expect(caps.supportsWaveform).toBe(true);
    expect(caps.supportsChord).toBe(true);
  });

  it("grants EQ/pitch/waveform/chord but no transport control for mic input", () => {
    expect(capabilitiesFor("mic")).toEqual({
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsChord: true,
      supportsSpeedChange: false,
      supportsLoop: false,
      loopPrecision: "approximate",
    });
  });
});
