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
    <div
      data-testid="pitch-display"
      className="scope"
      style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "14px 18px" }}
    >
      <span
        data-testid="pitch-display-note-label"
        className={pitch.detected ? "readout" : "readout readout--idle"}
        style={{ fontSize: "2.1rem", fontWeight: 700, lineHeight: 1 }}
      >
        {pitch.detected ? pitch.noteName : "--"}
      </span>
      <span data-testid="pitch-display-frequency-label" className="readout readout--sm readout--idle">
        {pitch.detected && pitch.frequencyHz ? `${pitch.frequencyHz.toFixed(1)}Hz` : ""}
      </span>
    </div>
  );
}
