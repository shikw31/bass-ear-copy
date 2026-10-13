import { clampGainDb } from "../logic/bassEqGain";
import type { LocalAudioEngine } from "./localAudioEngine";

// BassEQProcessor (see components.md). BiquadFilterNode's own `gain` AudioParam is specified in
// dB for a lowshelf filter, so the clamped value is assigned directly — no linear conversion.
export class BassEqProcessor {
  private filterNode: BiquadFilterNode | null = null;
  private lastGainDb = 0;

  attach(engine: LocalAudioEngine): void {
    this.filterNode = engine.getEqFilterNode();
  }

  setGainDb(gainDb: number): void {
    this.lastGainDb = clampGainDb(gainDb);
    if (this.filterNode) this.filterNode.gain.value = this.lastGainDb;
  }

  getGainDb(): number {
    return this.lastGainDb;
  }

  bypass(enabled: boolean): void {
    if (this.filterNode) this.filterNode.gain.value = enabled ? 0 : this.lastGainDb;
  }
}
