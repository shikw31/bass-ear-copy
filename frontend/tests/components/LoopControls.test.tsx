import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoopControls } from "../../src/components/LoopControls";
import { LoopEditor } from "../../src/playback/loopEditor";
import type { PlaybackSource } from "../../src/playback/playbackSource";

function fakeSource(getCurrentTime: () => number): PlaybackSource {
  return {
    load: async () => {},
    play: () => {},
    pause: () => {},
    seek: () => {},
    setLoop: () => {},
    clearLoop: () => {},
    getCurrentTime,
    getDuration: () => 100,
    onTimeUpdate: () => () => {},
    getCapabilities: () => ({
      supportsEQ: true,
      supportsPitchDisplay: true,
      supportsWaveform: true,
      supportsSpeedChange: true,
      loopPrecision: "sample",
    }),
    dispose: () => {},
  };
}

describe("LoopControls", () => {
  it("sets A then B from the current playback position and shows the resulting range", () => {
    let currentTime = 5;
    const source = fakeSource(() => currentTime);
    const editor = new LoopEditor();
    editor.attach(source);

    render(
      <LoopControls
        loopEditor={editor}
        capabilities={source.getCapabilities()}
        getCurrentTime={() => currentTime}
      />,
    );

    fireEvent.click(screen.getByTestId("loop-controls-set-a-button"));
    currentTime = 15;
    fireEvent.click(screen.getByTestId("loop-controls-set-b-button"));

    expect(screen.getByTestId("loop-controls-points-label")).toHaveTextContent("5.0s 〜 15.0s");
  });

  it("shows the approximate-precision note for YouTube-capable sources", () => {
    const source = fakeSource(() => 0);
    const editor = new LoopEditor();
    editor.attach(source);

    render(
      <LoopControls
        loopEditor={editor}
        capabilities={{ ...source.getCapabilities(), loopPrecision: "approximate" }}
        getCurrentTime={() => 0}
      />,
    );

    expect(screen.getByTestId("loop-controls-precision-note")).toBeInTheDocument();
  });
});
