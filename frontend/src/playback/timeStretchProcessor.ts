import { clampPlaybackRate } from "../logic/timeStretchRate";
import type { LocalAudioEngine } from "./localAudioEngine";

// TimeStretchProcessor (see components.md). Relies on HTMLAudioElement.preservesPitch
// (see localAudioEngine.ts) rather than implementing a phase vocoder.
export class TimeStretchProcessor {
  private audioElement: HTMLAudioElement | null = null;
  private rate = 1.0;

  attach(engine: LocalAudioEngine): void {
    this.audioElement = engine.getAudioElement();
    this.audioElement.preservesPitch = true;
  }

  setRate(rate: number): void {
    this.rate = clampPlaybackRate(rate);
    if (this.audioElement) this.audioElement.playbackRate = this.rate;
  }

  getRate(): number {
    return this.rate;
  }
}
