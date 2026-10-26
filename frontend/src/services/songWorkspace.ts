import type { PlaybackSource } from "../playback/playbackSource";
import { BassEqProcessor } from "../playback/bassEqProcessor";
import { TimeStretchProcessor } from "../playback/timeStretchProcessor";
import { PitchDetector } from "../playback/pitchDetector";
import { WaveformVisualizer } from "../playback/waveformVisualizer";
import { ChordDetector } from "../playback/chordDetector";
import { LoopEditor } from "../playback/loopEditor";
import type { LocalAudioEngine } from "../playback/localAudioEngine";
import type { MicrophoneInputSource } from "../playback/microphoneInputSource";
import type { YouTubePlayerAdapter } from "../playback/youtubePlayerAdapter";
import type { PitchResult, SongWorkspaceState, SourceType, TranscriptEntry } from "../domain/types";
import { validateMemoText, type ValidationResult } from "../logic/validation";
import { loadSongState, saveSongState } from "../logic/localStorageAdapter";
import { NoteTranscriptLogger } from "../logic/noteTranscriptLogger";
import { formatPosition, primaryPositionForFrequency } from "../logic/bassPosition";

// Caps unbounded growth over a long practice session; oldest entries drop off.
const MAX_TRANSCRIPT_ENTRIES = 500;

export interface SongWorkspaceParams {
  songKey: string;
  sourceType: SourceType;
  source: PlaybackSource;
}

// Anything that exposes the general + bass-filtered analyser pair — LocalAudioEngine,
// MicrophoneInputSource, and YouTubePlayerAdapter (once enableAnalysisCapture() succeeds).
interface AnalysisCapableSource {
  getAnalyserNode(): AnalyserNode;
  getPitchAnalyserNode(): AnalyserNode;
}

// SongWorkspace (see components.md). Aggregates one song's playback source, the
// EQ/TimeStretch/Pitch/Waveform/Chord processors (available whenever raw audio is reachable —
// always for local/mic, only after opt-in tab-audio capture for YouTube), the LoopEditor, and
// the memo text. Persistence is local-only (browser storage, keyed by songKey) — there is no
// account/login or cross-device sync (see aidlc-docs project decision: login-less scope
// reduction).
export class SongWorkspace {
  readonly songKey: string;
  readonly sourceType: SourceType;
  readonly source: PlaybackSource;
  readonly loopEditor = new LoopEditor();
  readonly eq: BassEqProcessor | null;
  readonly timeStretch: TimeStretchProcessor | null;
  pitchDetector: PitchDetector | null = null;
  waveform: WaveformVisualizer | null = null;
  chordDetector: ChordDetector | null = null;
  private analyserNode: AnalyserNode | null = null;
  private readonly transcriptLogger: NoteTranscriptLogger;

  private memoText = "";
  private transcript: TranscriptEntry[] = [];
  private updatedAt = 0;

  constructor({ songKey, sourceType, source }: SongWorkspaceParams) {
    this.songKey = songKey;
    this.sourceType = sourceType;
    this.source = source;
    this.loopEditor.attach(source);

    // Auto-logs held notes as you play — see noteTranscriptLogger.ts. Saves immediately so a
    // session isn't lost if the user never presses the manual Save button (the whole point was
    // that typing along is too fast — see requirements.md Change Log).
    this.transcriptLogger = new NoteTranscriptLogger((noteName, frequencyHz) => {
      const position = primaryPositionForFrequency(frequencyHz);
      const entry: TranscriptEntry = {
        time: this.source.getCurrentTime(),
        note: noteName,
        position: position ? formatPosition(position) : "",
      };
      this.transcript = [...this.transcript, entry].slice(-MAX_TRANSCRIPT_ENTRIES);
      this.updatedAt = Date.now();
      saveSongState(this.exportState());
    });

    if (sourceType === "local") {
      const engine = source as LocalAudioEngine;
      this.eq = new BassEqProcessor();
      this.eq.attach(engine);
      this.timeStretch = new TimeStretchProcessor();
      this.timeStretch.attach(engine);
      this.attachAnalysis(engine);
    } else if (sourceType === "mic") {
      // No transport to control (no speed change, no loop) — see capabilities.ts — but raw
      // audio is available, so EQ/pitch/waveform/chord work the same way as for local files.
      const mic = source as MicrophoneInputSource;
      this.eq = new BassEqProcessor();
      this.eq.attach(mic);
      this.timeStretch = null;
      this.attachAnalysis(mic);
    } else {
      // "youtube": no raw-audio access until the user opts into tab-audio capture (see
      // enableYoutubeAnalysis()) — see capabilities.ts for why EQ never becomes available even
      // then.
      this.eq = null;
      this.timeStretch = null;
    }
  }

  private attachAnalysis(engine: AnalysisCapableSource): void {
    this.analyserNode = engine.getAnalyserNode();
    // Pitch/chord detection use their own analysers (see localAudioEngine.ts) — pitch gets a
    // steeply-filtered one (a full mix swamps monophonic detection), chord detection reads the
    // general one (it needs the harmony instruments, not just the bass fundamental).
    this.pitchDetector = new PitchDetector();
    this.pitchDetector.attach(engine.getPitchAnalyserNode());
    this.chordDetector = new ChordDetector();
    this.chordDetector.attach(this.analyserNode);
    this.waveform = new WaveformVisualizer();
  }

  // Opt-in tab-audio capture for a YouTube source — see youtubePlayerAdapter.ts. No-op (resolves
  // immediately) for non-YouTube sources, which already have analysis attached at construction.
  async enableYoutubeAnalysis(): Promise<void> {
    if (this.sourceType !== "youtube") return;
    const adapter = this.source as YouTubePlayerAdapter;
    await adapter.enableAnalysisCapture();
    this.attachAnalysis(adapter);
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  // Feeds the live pitch-detector stream in (see PitchDisplay.tsx) so held notes get logged.
  observePitch(pitch: PitchResult): void {
    this.transcriptLogger.observe(pitch);
  }

  getTranscript(): TranscriptEntry[] {
    return this.transcript;
  }

  clearTranscript(): void {
    this.transcript = [];
    this.transcriptLogger.reset();
    this.updatedAt = Date.now();
    saveSongState(this.exportState());
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
      transcript: this.transcript,
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
    // Older saved states (before this feature) have no transcript field.
    this.transcript = state.transcript ?? [];
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
    this.chordDetector?.stop();
    this.source.dispose();
  }
}
