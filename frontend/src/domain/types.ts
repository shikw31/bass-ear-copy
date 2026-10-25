// Domain entities (see aidlc-docs/construction/frontend-web-app/functional-design/domain-entities.md)

// "mic": an external source (YouTube on another device, a CD, a live instrument) monitored
// live through the microphone — see playback/microphoneInputSource.ts for why this exists
// (YouTube's own embed can't expose raw audio for EQ/pitch/waveform processing).
export type SourceType = "local" | "youtube" | "mic";

export interface Song {
  songKey: string;
  sourceType: SourceType;
  displayName: string;
  durationSec: number;
}

export interface LoopPoints {
  a: number;
  b: number;
  enabled: boolean;
}

export interface Memo {
  text: string;
  updatedAt: number;
}

export interface SongWorkspaceState {
  songKey: string;
  loopPoints: LoopPoints | null;
  memo: Memo | null;
  updatedAt: number;
}

export interface PitchResult {
  noteName: string | null;
  frequencyHz: number | null;
  confidence: number;
  detected: boolean;
}

export interface PlaybackCapabilities {
  supportsEQ: boolean;
  supportsPitchDisplay: boolean;
  supportsWaveform: boolean;
  supportsSpeedChange: boolean;
  supportsLoop: boolean;
  loopPrecision: "sample" | "approximate";
}

