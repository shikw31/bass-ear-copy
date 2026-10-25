import { useEffect, useState } from "react";
import type { PitchDetector } from "../playback/pitchDetector";
import type { PitchResult } from "../domain/types";
import { formatPosition, primaryPositionForFrequency } from "../logic/bassPosition";

interface Props {
  pitchDetector: PitchDetector;
  onPitchUpdate?: (pitch: PitchResult) => void;
}

export function PitchDisplay({ pitchDetector, onPitchUpdate }: Props) {
  const [pitch, setPitch] = useState<PitchResult>({
    noteName: null,
    frequencyHz: null,
    confidence: 0,
    detected: false,
  });

  useEffect(() => {
    pitchDetector.start((next) => {
      setPitch(next);
      onPitchUpdate?.(next);
    });
    return () => pitchDetector.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitchDetector]);

  const position = pitch.detected && pitch.frequencyHz ? primaryPositionForFrequency(pitch.frequencyHz) : null;

  return (
    <div
      data-testid="pitch-display"
      className="scope"
      style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "14px 18px", flexWrap: "wrap" }}
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
      {position && (
        <span data-testid="pitch-display-position-label" className="readout readout--sm readout--teal">
          {formatPosition(position)}
        </span>
      )}
    </div>
  );
}
