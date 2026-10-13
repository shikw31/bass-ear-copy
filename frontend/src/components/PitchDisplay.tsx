import { useEffect, useState } from "react";
import type { PitchDetector } from "../playback/pitchDetector";
import type { PitchResult } from "../domain/types";

interface Props {
  pitchDetector: PitchDetector;
}

export function PitchDisplay({ pitchDetector }: Props) {
  const [pitch, setPitch] = useState<PitchResult>({
    noteName: null,
    frequencyHz: null,
    confidence: 0,
    detected: false,
  });

  useEffect(() => {
    pitchDetector.start(setPitch);
    return () => pitchDetector.stop();
  }, [pitchDetector]);

  return (
    <div data-testid="pitch-display">
      <span data-testid="pitch-display-note-label">
        {pitch.detected ? pitch.noteName : "--"}
      </span>
      <span data-testid="pitch-display-frequency-label">
        {pitch.detected && pitch.frequencyHz ? `${pitch.frequencyHz.toFixed(1)}Hz` : ""}
      </span>
    </div>
  );
}
