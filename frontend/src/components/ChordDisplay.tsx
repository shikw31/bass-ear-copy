import { useEffect, useState } from "react";
import type { ChordDetector } from "../playback/chordDetector";
import type { ChordGuess } from "../logic/chordDetection";
import { formatChord } from "../logic/chordDetection";

interface Props {
  chordDetector: ChordDetector;
}

const IDLE: ChordGuess = { root: null, quality: null, confidence: 0, detected: false };

// ChordDisplay — explicitly labeled "参考" (reference only): chord guesses from a plain FFT
// chroma match are much less reliable than the monophonic pitch detector, especially on a full
// mix. See chordDetection.ts / requirements.md Change Log.
export function ChordDisplay({ chordDetector }: Props) {
  const [chord, setChord] = useState<ChordGuess>(IDLE);

  useEffect(() => {
    chordDetector.start(setChord);
    return () => chordDetector.stop();
  }, [chordDetector]);

  return (
    <div data-testid="chord-display" style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span className="field-label" style={{ margin: 0 }}>
        コード（参考）
      </span>
      <span
        data-testid="chord-display-label"
        className={chord.detected ? "readout readout--teal" : "readout readout--idle"}
        style={{ fontSize: "1.3rem", fontWeight: 700 }}
      >
        {formatChord(chord)}
      </span>
    </div>
  );
}
