import type { PlaybackSource } from "./playbackSource";
import { validateLoopPoints } from "../logic/validation";

// LoopEditor (see components.md). Works against the PlaybackSource interface, so it behaves
// identically whether the active source is LocalAudioEngine (sample-ish precision) or
// YouTubePlayerAdapter (approximate precision) — see domain-entities.md PlaybackCapabilities.
export class LoopEditor {
  private source: PlaybackSource | null = null;
  private points: { a: number; b: number } | null = null;
  private enabled = false;
  private lastError: string | null = null;

  attach(source: PlaybackSource): void {
    this.source = source;
    this.points = null;
    this.enabled = false;
  }

  setPointA(timeSec: number): boolean {
    return this.trySetPoints(timeSec, this.points?.b ?? this.source?.getDuration() ?? 0);
  }

  setPointB(timeSec: number): boolean {
    return this.trySetPoints(this.points?.a ?? 0, timeSec);
  }

  getLoopPoints(): { a: number; b: number } | null {
    return this.points;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  enableLoop(enabled: boolean): void {
    this.enabled = enabled;
    if (!this.source) return;
    if (enabled && this.points) {
      this.source.setLoop(this.points.a, this.points.b);
    } else {
      this.source.clearLoop();
    }
  }

  private trySetPoints(a: number, b: number): boolean {
    if (!this.source) return false;
    const result = validateLoopPoints(a, b, this.source.getDuration());
    if (!result.valid) {
      this.lastError = result.error;
      return false;
    }
    this.lastError = null;
    this.points = { a, b };
    if (this.enabled) this.source.setLoop(a, b);
    return true;
  }
}
