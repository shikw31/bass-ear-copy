import type { PlaybackSource } from "./playbackSource";
import type { PlaybackCapabilities } from "../domain/types";
import { capabilitiesFor } from "../logic/capabilities";

// Minimal shape of the YouTube IFrame Player API we rely on (the full typings ship with
// @types/youtube; kept inline here to avoid adding a dependency for a handful of calls).
interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setPlaybackRate(rate: number): void;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          events: { onReady: () => void };
        },
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

// YouTubePlayerAdapter (see components.md / component-methods.md).
// loopPrecision is "approximate": seekTo() is not sample-accurate and has network/player latency,
// unlike LocalAudioEngine's requestAnimationFrame-driven loop watcher.
export class YouTubePlayerAdapter implements PlaybackSource {
  private player: YouTubePlayer | null = null;
  private readonly container: HTMLElement;
  private readonly videoId: string;
  private loopPoints: { a: number; b: number } | null = null;
  private loopIntervalHandle: number | null = null;
  private readonly timeUpdateCallbacks = new Set<(t: number) => void>();
  private timeUpdateIntervalHandle: number | null = null;

  // Opt-in tab-audio capture for EQ/pitch/waveform/chord *analysis only* (see
  // enableAnalysisCapture()) — never connected to an output, so it doesn't duplicate the tab's
  // own already-audible playback.
  private hasAnalysisCapture = false;
  private analysisStream: MediaStream | null = null;
  private analysisAudioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private pitchAnalyserNode: AnalyserNode | null = null;

  constructor(container: HTMLElement, videoId: string) {
    this.container = container;
    this.videoId = videoId;
  }

  async load(): Promise<void> {
    await loadYouTubeIframeApi();
    await new Promise<void>((resolve) => {
      this.player = new window.YT!.Player(this.container, {
        videoId: this.videoId,
        events: { onReady: () => resolve() },
      });
    });
    this.timeUpdateIntervalHandle = window.setInterval(() => {
      if (!this.player) return;
      const t = this.player.getCurrentTime();
      for (const cb of this.timeUpdateCallbacks) cb(t);
    }, 250);
  }

  play(): void {
    this.player?.playVideo();
    this.startLoopWatcher();
  }

  pause(): void {
    this.player?.pauseVideo();
    this.stopLoopWatcher();
  }

  seek(timeSec: number): void {
    this.player?.seekTo(timeSec, true);
  }

  setLoop(aSec: number, bSec: number): void {
    this.loopPoints = { a: aSec, b: bSec };
    this.startLoopWatcher();
  }

  clearLoop(): void {
    this.loopPoints = null;
    this.stopLoopWatcher();
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  getDuration(): number {
    return this.player?.getDuration() ?? 0;
  }

  onTimeUpdate(callback: (t: number) => void): () => void {
    this.timeUpdateCallbacks.add(callback);
    return () => this.timeUpdateCallbacks.delete(callback);
  }

  getCapabilities(): PlaybackCapabilities {
    return capabilitiesFor("youtube", this.hasAnalysisCapture);
  }

  setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate(rate);
  }

  // Opt-in: captures this browser tab's audio output (via the standard tab-sharing picker) for
  // EQ/pitch/waveform/chord *analysis* — not to change what's heard, which remains impossible
  // for the embedded player's own in-tab audio (see the project decision log: muting the
  // original to substitute a processed copy just captures silence). The user must pick "this
  // tab" and enable audio sharing in the browser's picker.
  async enableAnalysisCapture(): Promise<void> {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch {
      throw new Error("タブの共有がキャンセルされました");
    }
    // Video is required by the browser's tab-capture API but unused here — stop it immediately.
    stream.getVideoTracks().forEach((track) => track.stop());
    if (stream.getAudioTracks().length === 0) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("タブの音声が共有されませんでした。共有時に「タブの音声を共有」を選択してください");
    }

    this.analysisStream = stream;
    this.analysisAudioContext = new AudioContext();
    const sourceNode = this.analysisAudioContext.createMediaStreamSource(stream);

    this.analyserNode = this.analysisAudioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;

    // Dedicated pitch-detection branch — see localAudioEngine.ts for the fftSize rationale.
    const pitchFilterNode = this.analysisAudioContext.createBiquadFilter();
    pitchFilterNode.type = "lowpass";
    pitchFilterNode.frequency.value = 250;
    pitchFilterNode.Q.value = 1;
    this.pitchAnalyserNode = this.analysisAudioContext.createAnalyser();
    this.pitchAnalyserNode.fftSize = 2048;

    sourceNode.connect(this.analyserNode);
    sourceNode.connect(pitchFilterNode);
    pitchFilterNode.connect(this.pitchAnalyserNode);
    // Deliberately never connected to analysisAudioContext.destination.

    this.hasAnalysisCapture = true;
  }

  getAnalyserNode(): AnalyserNode {
    if (!this.analyserNode) throw new Error("enableAnalysisCapture() must be called first");
    return this.analyserNode;
  }

  getPitchAnalyserNode(): AnalyserNode {
    if (!this.pitchAnalyserNode) throw new Error("enableAnalysisCapture() must be called first");
    return this.pitchAnalyserNode;
  }

  dispose(): void {
    this.stopLoopWatcher();
    if (this.timeUpdateIntervalHandle !== null) window.clearInterval(this.timeUpdateIntervalHandle);
    this.player?.destroy();
    this.analysisStream?.getTracks().forEach((track) => track.stop());
    void this.analysisAudioContext?.close();
  }

  private startLoopWatcher(): void {
    this.stopLoopWatcher();
    // Polled on an interval (not per-frame) since YouTube's getCurrentTime() itself updates at a
    // coarser rate than the browser's animation frame — matches the "approximate" capability.
    this.loopIntervalHandle = window.setInterval(() => {
      if (this.loopPoints && this.player && this.player.getCurrentTime() >= this.loopPoints.b) {
        this.player.seekTo(this.loopPoints.a, true);
      }
    }, 200);
  }

  private stopLoopWatcher(): void {
    if (this.loopIntervalHandle !== null) {
      window.clearInterval(this.loopIntervalHandle);
      this.loopIntervalHandle = null;
    }
  }
}
