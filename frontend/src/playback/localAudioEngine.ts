import type { PlaybackSource } from "./playbackSource";
import type { PlaybackCapabilities } from "../domain/types";
import { capabilitiesFor } from "../logic/capabilities";

// LocalAudioEngine (see components.md / component-methods.md).
//
// Built on HTMLAudioElement rather than AudioBufferSourceNode because only the media-element
// path exposes `preservesPitch`, which gives us pitch-preserving slow playback (FR4) for free
// instead of hand-rolling a phase vocoder (see tech-stack-decisions.md).
//
// Known precision trade-off: because looping re-seeks `audioElement.currentTime` from a
// requestAnimationFrame check rather than using AudioBufferSourceNode's sample-accurate
// loopStart/loopEnd, the loop boundary can be off by roughly one animation frame (~16ms) rather
// than being bit-exact. This is still far tighter than YouTube's seek-based loop (hundreds of
// ms) and was judged an acceptable trade-off against implementing a second, non-pitch-preserving
// playback path — flagged here for visibility rather than silently claiming sample-exactness.
export class LocalAudioEngine implements PlaybackSource {
  private readonly audioElement: HTMLAudioElement;
  private readonly audioContext: AudioContext;
  private readonly eqFilterNode: BiquadFilterNode;
  private readonly analyserNode: AnalyserNode;
  private readonly pitchAnalyserNode: AnalyserNode;
  private readonly objectUrl: string;
  private loopPoints: { a: number; b: number } | null = null;
  private loopRafHandle: number | null = null;
  private readonly timeUpdateCallbacks = new Set<(t: number) => void>();

  constructor(file: File) {
    this.objectUrl = URL.createObjectURL(file);
    this.audioElement = new Audio(this.objectUrl);
    this.audioElement.preservesPitch = true;
    this.audioElement.crossOrigin = "anonymous";

    this.audioContext = new AudioContext();
    const sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
    this.eqFilterNode = this.audioContext.createBiquadFilter();
    this.eqFilterNode.type = "lowshelf";
    this.eqFilterNode.frequency.value = 100;
    this.eqFilterNode.gain.value = 0;

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;

    // Dedicated pitch-detection branch: a real song mix has drums/vocals/guitar on top of the
    // bass, and monophonic pitch detection (pitchy) gets swamped by that if it sees the whole
    // spectrum. A steep lowpass isolates the bass-ish band before analysis, separately from the
    // gentle, user-controlled EQ (which shapes what you *hear*, not what the detector sees).
    // fftSize 2048 gives ~46ms of signal at 44.1kHz — a little under 2 full periods even at the
    // bottom of the bass band (~41Hz ≈ 24ms/cycle), which is enough for pitchy's MPM algorithm.
    // (A larger window was tried first but smeared fast passages — real playing showed notes
    // well under 200ms, so time resolution matters more here than a bigger safety margin.)
    const pitchFilterNode = this.audioContext.createBiquadFilter();
    pitchFilterNode.type = "lowpass";
    pitchFilterNode.frequency.value = 250;
    pitchFilterNode.Q.value = 1;
    this.pitchAnalyserNode = this.audioContext.createAnalyser();
    this.pitchAnalyserNode.fftSize = 2048;

    sourceNode.connect(this.eqFilterNode);
    this.eqFilterNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
    this.eqFilterNode.connect(pitchFilterNode);
    pitchFilterNode.connect(this.pitchAnalyserNode);

    this.audioElement.addEventListener("timeupdate", () => {
      for (const cb of this.timeUpdateCallbacks) cb(this.audioElement.currentTime);
    });
  }

  async load(): Promise<void> {
    if (this.audioElement.readyState >= 1) return;
    await new Promise<void>((resolve, reject) => {
      this.audioElement.addEventListener("loadedmetadata", () => resolve(), { once: true });
      this.audioElement.addEventListener("error", () => reject(new Error("音声の読み込みに失敗しました")), {
        once: true,
      });
    });
  }

  play(): void {
    if (this.audioContext.state === "suspended") {
      void this.audioContext.resume();
    }
    void this.audioElement.play();
    this.startLoopWatcher();
  }

  pause(): void {
    this.audioElement.pause();
    this.stopLoopWatcher();
  }

  seek(timeSec: number): void {
    this.audioElement.currentTime = timeSec;
  }

  setLoop(aSec: number, bSec: number): void {
    this.loopPoints = { a: aSec, b: bSec };
    if (!this.audioElement.paused) this.startLoopWatcher();
  }

  clearLoop(): void {
    this.loopPoints = null;
    this.stopLoopWatcher();
  }

  getCurrentTime(): number {
    return this.audioElement.currentTime;
  }

  getDuration(): number {
    return this.audioElement.duration || 0;
  }

  onTimeUpdate(callback: (t: number) => void): () => void {
    this.timeUpdateCallbacks.add(callback);
    return () => this.timeUpdateCallbacks.delete(callback);
  }

  getCapabilities(): PlaybackCapabilities {
    return capabilitiesFor("local");
  }

  getAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }

  getEqFilterNode(): BiquadFilterNode {
    return this.eqFilterNode;
  }

  getAnalyserNode(): AnalyserNode {
    return this.analyserNode;
  }

  getPitchAnalyserNode(): AnalyserNode {
    return this.pitchAnalyserNode;
  }

  dispose(): void {
    this.stopLoopWatcher();
    this.audioElement.pause();
    URL.revokeObjectURL(this.objectUrl);
    void this.audioContext.close();
  }

  private startLoopWatcher(): void {
    this.stopLoopWatcher();
    const tick = () => {
      if (this.loopPoints && this.audioElement.currentTime >= this.loopPoints.b) {
        this.audioElement.currentTime = this.loopPoints.a;
      }
      this.loopRafHandle = requestAnimationFrame(tick);
    };
    this.loopRafHandle = requestAnimationFrame(tick);
  }

  private stopLoopWatcher(): void {
    if (this.loopRafHandle !== null) {
      cancelAnimationFrame(this.loopRafHandle);
      this.loopRafHandle = null;
    }
  }
}
