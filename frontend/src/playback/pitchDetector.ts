import { PitchDetector as PitchyDetector } from "pitchy";
import type { PitchResult } from "../domain/types";
import { toPitchResult } from "../logic/pitchMapping";
import { startThrottledLoop } from "./audioAnalysisLoop";

const TARGET_HZ = 15; // within the 10-20Hz NFR target

// PitchDetector (see components.md). Delegates the actual frequency estimation (including
// octave-error handling) to pitchy's McLeod Pitch Method implementation — see
// tech-stack-decisions.md — and applies our own bass-band gating (pitchMapping.ts).
export class PitchDetector {
  private analyserNode: AnalyserNode | null = null;
  private pitchy: ReturnType<typeof PitchyDetector.forFloat32Array> | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;
  private stopLoop: (() => void) | null = null;

  attach(analyserNode: AnalyserNode): void {
    this.analyserNode = analyserNode;
    this.pitchy = PitchyDetector.forFloat32Array(analyserNode.fftSize);
    this.buffer = new Float32Array(analyserNode.fftSize);
  }

  start(onDetect: (result: PitchResult) => void): void {
    if (!this.analyserNode || !this.pitchy || !this.buffer) {
      throw new Error("PitchDetector.attach() must be called before start()");
    }
    this.stopLoop = startThrottledLoop(1000 / TARGET_HZ, () => {
      this.analyserNode!.getFloatTimeDomainData(this.buffer!);
      const [frequency, clarity] = this.pitchy!.findPitch(
        this.buffer!,
        this.analyserNode!.context.sampleRate,
      );
      onDetect(toPitchResult(frequency, clarity));
    });
  }

  stop(): void {
    this.stopLoop?.();
    this.stopLoop = null;
  }
}
