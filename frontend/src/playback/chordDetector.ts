import type { ChordGuess } from "../logic/chordDetection";
import { chromaFromFrequencyMagnitudes, guessChordFromChroma } from "../logic/chordDetection";
import { startThrottledLoop } from "./audioAnalysisLoop";

// Chords change far less often than individual notes, so this polls much slower than
// PitchDetector's 30Hz — saves CPU and reduces chord-guess flicker.
const TARGET_HZ = 8;

// ChordDetector (see components.md / the user's chord-analysis request). Reads the *general*
// (unfiltered) analyser — unlike PitchDetector, which needs the bass-isolated one — because a
// chord guess needs the harmony instruments' frequencies, not just the bass fundamental.
export class ChordDetector {
  private analyserNode: AnalyserNode | null = null;
  private dbBuffer: Float32Array<ArrayBuffer> | null = null;
  private stopLoop: (() => void) | null = null;

  attach(analyserNode: AnalyserNode): void {
    this.analyserNode = analyserNode;
    this.dbBuffer = new Float32Array(analyserNode.frequencyBinCount);
  }

  start(onDetect: (result: ChordGuess) => void): void {
    if (!this.analyserNode || !this.dbBuffer) {
      throw new Error("ChordDetector.attach() must be called before start()");
    }
    this.stopLoop = startThrottledLoop(1000 / TARGET_HZ, () => {
      const analyser = this.analyserNode!;
      const dbBuffer = this.dbBuffer!;
      analyser.getFloatFrequencyData(dbBuffer);
      const linearMagnitudes = new Array(dbBuffer.length);
      for (let i = 0; i < dbBuffer.length; i++) {
        const db = dbBuffer[i];
        linearMagnitudes[i] = Number.isFinite(db) ? Math.pow(10, db / 20) : 0;
      }
      const chroma = chromaFromFrequencyMagnitudes(linearMagnitudes, analyser.context.sampleRate, analyser.fftSize);
      onDetect(guessChordFromChroma(chroma));
    });
  }

  stop(): void {
    this.stopLoop?.();
    this.stopLoop = null;
  }
}
