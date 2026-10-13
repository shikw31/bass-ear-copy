import type { PlaybackCapabilities } from "../domain/types";

// PlaybackSource interface (see components.md / component-methods.md).
// LocalAudioEngine and YouTubePlayerAdapter both implement this so the rest of the app
// (LoopEditor, TransportControls, SongWorkspace) never needs to know which one it's holding.
export interface PlaybackSource {
  load(): Promise<void>;
  play(): void;
  pause(): void;
  seek(timeSec: number): void;
  setLoop(aSec: number, bSec: number): void;
  clearLoop(): void;
  getCurrentTime(): number;
  getDuration(): number;
  onTimeUpdate(callback: (t: number) => void): () => void;
  getCapabilities(): PlaybackCapabilities;
  dispose(): void;
}
