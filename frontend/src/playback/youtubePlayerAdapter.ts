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
    return capabilitiesFor("youtube");
  }

  setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate(rate);
  }

  dispose(): void {
    this.stopLoopWatcher();
    if (this.timeUpdateIntervalHandle !== null) window.clearInterval(this.timeUpdateIntervalHandle);
    this.player?.destroy();
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
