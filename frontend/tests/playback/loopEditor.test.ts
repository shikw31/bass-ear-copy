import { describe, expect, it } from "vitest";
import { LoopEditor } from "../../src/playback/loopEditor";
import type { PlaybackSource } from "../../src/playback/playbackSource";

function fakeSource(durationSec: number): PlaybackSource & { loop: { a: number; b: number } | null } {
  return {
    loop: null,
    load: async () => {},
    play: () => {},
    pause: () => {},
    seek: () => {},
    setLoop(a, b) {
      this.loop = { a, b };
    },
    clearLoop() {
      this.loop = null;
    },
    getCurrentTime: () => 0,
    getDuration: () => durationSec,
    onTimeUpdate: () => () => {},
    getCapabilities: () => ({
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsSpeedChange: true,
      supportsChord: true,
      supportsLoop: true,
      loopPrecision: "sample",
    }),
    dispose: () => {},
  };
}

describe("LoopEditor (integration with validation rules)", () => {
  it("accepts a valid A/B pair and applies it to the source once enabled", () => {
    const source = fakeSource(100);
    const editor = new LoopEditor();
    editor.attach(source);

    expect(editor.setPointA(10)).toBe(true);
    expect(editor.setPointB(20)).toBe(true);
    expect(editor.getLoopPoints()).toEqual({ a: 10, b: 20 });

    editor.enableLoop(true);
    expect(source.loop).toEqual({ a: 10, b: 20 });
  });

  it("rejects an invalid pair and keeps the previous valid points", () => {
    const source = fakeSource(100);
    const editor = new LoopEditor();
    editor.attach(source);
    editor.setPointA(10);
    editor.setPointB(20);

    const ok = editor.setPointB(10.1); // b - a < 0.5s minimum
    expect(ok).toBe(false);
    expect(editor.getLastError()).toBeTruthy();
    expect(editor.getLoopPoints()).toEqual({ a: 10, b: 20 });
  });

  it("clears the source loop when disabled", () => {
    const source = fakeSource(100);
    const editor = new LoopEditor();
    editor.attach(source);
    editor.setPointA(10);
    editor.setPointB(20);
    editor.enableLoop(true);
    editor.enableLoop(false);
    expect(source.loop).toBeNull();
  });
});
