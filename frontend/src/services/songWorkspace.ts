import type { PlaybackSource } from "../playback/playbackSource";
import { BassEqProcessor } from "../playback/bassEqProcessor";
import { TimeStretchProcessor } from "../playback/timeStretchProcessor";
import { PitchDetector } from "../playback/pitchDetector";
import { WaveformVisualizer } from "../playback/waveformVisualizer";
import { LoopEditor } from "../playback/loopEditor";
import type { LocalAudioEngine } from "../playback/localAudioEngine";
import type { MicrophoneInputSource } from "../playback/microphoneInputSource";
import type { SongWorkspaceState, SourceType } from "../domain/types";
import { validateMemoText, type ValidationResult } from "../logic/validation";
import { loadSongState, saveSongState } from "../logic/localStorageAdapter";

export interface SongWorkspaceParams {
  songKey: string;
  sourceType: SourceType;
  source: PlaybackSource;
}

// SongWorkspace (see components.md). Aggregates one song's playback source, the
// Local-only processors (EQ/TimeStretch/Pitch/Waveform — null for YouTube sources), the
// LoopEditor, and the memo text. Persistence is local-only (browser storage, keyed by songKey) —
// there is no account/login or cross-device sync (see aidlc-docs project decision: login-less
// scope reduction).
export class SongWorkspace {
  readonly songKey: string;
  readonly sourceType: SourceType;
  readonly source: PlaybackSource;
  readonly loopEditor = new LoopEditor();
  readonly eq: BassEqProcessor | null;
  readonly timeStretch: TimeStretchProcessor | null;
  readonly pitchDetector: PitchDetector | null;
  readonly waveform: WaveformVisualizer | null;
  private readonly analyserNode: AnalyserNode | null;

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
      this.analyserNode = engine.getAnalyserNode();
      // Pitch detection uses its own steeply-filtered analyser (see localAudioEngine.ts), not
      // the general one used for waveform/output — a full mix swamps monophonic detection.
      this.pitchDetector = new PitchDetector();
      this.pitchDetector.attach(engine.getPitchAnalyserNode());
      this.waveform = new WaveformVisualizer();
    } else if (sourceType === "mic") {
      // No transport to control (no speed change, no loop) — see capabilities.ts — but raw
      // audio is available, so EQ/pitch/waveform work the same way as for local files.
      const mic = source as MicrophoneInputSource;
      this.eq = new BassEqProcessor();
      this.eq.attach(mic);
      this.timeStretch = null;
      this.analyserNode = mic.getAnalyserNode();
      this.pitchDetector = new PitchDetector();
      this.pitchDetector.attach(mic.getPitchAnalyserNode());
      this.waveform = new WaveformVisualizer();
    } else {
      this.eq = null;
      this.timeStretch = null;
      this.pitchDetector = null;
      this.waveform = null;
      this.analyserNode = null;
    }
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
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

  loadLocal(): void {
    const state = loadSongState(this.songKey);
    if (state) this.importState(state);
  }

  saveLocal(): void {
    saveSongState(this.exportState());
  }

  dispose(): void {
    this.waveform?.detach();
    this.pitchDetector?.stop();
    this.source.dispose();
  }
}
