import type { PlaybackSource } from "../playback/playbackSource";
import { BassEqProcessor } from "../playback/bassEqProcessor";
import { TimeStretchProcessor } from "../playback/timeStretchProcessor";
import { PitchDetector } from "../playback/pitchDetector";
import { WaveformVisualizer } from "../playback/waveformVisualizer";
import { LoopEditor } from "../playback/loopEditor";
import type { LocalAudioEngine } from "../playback/localAudioEngine";
import type { SongWorkspaceState, SourceType } from "../domain/types";
import { validateMemoText, type ValidationResult } from "../logic/validation";

export interface SongWorkspaceParams {
  songKey: string;
  sourceType: SourceType;
  source: PlaybackSource;
}

// SongWorkspace (see components.md). Aggregates one song's playback source, the
// Local-only processors (EQ/TimeStretch/Pitch/Waveform — null for YouTube sources), the
// LoopEditor, and the memo text, and knows how to (de)serialize the saved/synced slice of its
// state (loopPoints + memo) as a SongWorkspaceState.
export class SongWorkspace {
  readonly songKey: string;
  readonly sourceType: SourceType;
  readonly source: PlaybackSource;
  readonly loopEditor = new LoopEditor();
  readonly eq: BassEqProcessor | null;
  readonly timeStretch: TimeStretchProcessor | null;
  readonly pitchDetector: PitchDetector | null;
  readonly waveform: WaveformVisualizer | null;

  private memoText = "";
  private updatedAt = 0;

  constructor({ songKey, sourceType, source }: SongWorkspaceParams) {
    this.songKey = songKey;
    this.sourceType = sourceType;
    this.source = source;
    this.loopEditor.attach(source);

    if (sourceType === "local") {
      const engine = source as LocalAudioEngine;
      this.eq = new BassEqProcessor();
      this.eq.attach(engine);
      this.timeStretch = new TimeStretchProcessor();
      this.timeStretch.attach(engine);
      this.pitchDetector = new PitchDetector();
      this.pitchDetector.attach(engine.getAnalyserNode());
      this.waveform = new WaveformVisualizer();
    } else {
      this.eq = null;
      this.timeStretch = null;
      this.pitchDetector = null;
      this.waveform = null;
    }
  }

  getMemoText(): string {
    return this.memoText;
  }

  setMemoText(text: string): ValidationResult {
    const result = validateMemoText(text);
    if (result.valid) {
      this.memoText = text;
      this.updatedAt = Date.now();
    }
    return result;
  }

  exportState(): SongWorkspaceState {
    const points = this.loopEditor.getLoopPoints();
    return {
      songKey: this.songKey,
      loopPoints: points ? { a: points.a, b: points.b, enabled: true } : null,
      memo: this.memoText ? { text: this.memoText, updatedAt: this.updatedAt } : null,
      updatedAt: this.updatedAt || Date.now(),
    };
  }

  importState(state: SongWorkspaceState): void {
    if (state.loopPoints) {
      this.loopEditor.setPointA(state.loopPoints.a);
      this.loopEditor.setPointB(state.loopPoints.b);
      this.loopEditor.enableLoop(state.loopPoints.enabled);
    }
    if (state.memo) {
      this.memoText = state.memo.text;
    }
    this.updatedAt = state.updatedAt;
  }

  dispose(): void {
    this.waveform?.detach();
    this.pitchDetector?.stop();
    this.source.dispose();
  }
}
