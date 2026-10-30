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

// Auto-logged from the live pitch detector (see logic/noteTranscriptLogger.ts) — the user asked
// for notes to be recorded automatically because playing is too fast to type along to.
// In-memory for the current session only — not part of SongWorkspaceState. A transcript is
// effectively a note-by-note copy of a (likely copyrighted) song, so it isn't persisted to
// browser storage and starts empty again on every reload/reopen (see requirements.md Change
// Log). The "メモにコピー" action remains the way to keep anything from it.
export interface TranscriptEntry {
  time: number;
  note: string;
  position: string;
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
  supportsChord: boolean;
  supportsSpeedChange: boolean;
  supportsLoop: boolean;
  loopPrecision: "sample" | "approximate";
}

