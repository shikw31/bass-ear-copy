import type { PlaybackSource } from "./playbackSource";
import type { PlaybackCapabilities } from "../domain/types";
import { capabilitiesFor } from "../logic/capabilities";

// MicrophoneInputSource. YouTube's own embed can't expose raw audio for EQ/pitch/waveform
// processing (see youtubePlayerAdapter.ts and the project's decision log for why — muting the
// original to replace it with a processed copy in the same tab just captures silence). This
// source lets the user play the real source on a separate device/speaker and monitor it live
// through this app's microphone input instead — like plugging a practice amp's headphone-out
// into an effects pedal. There is no transport control over the original source: play()/pause()
// here only start/stop *monitoring* through this app's output (recommend headphones — otherwise
// the mic will pick the processed signal back up from the speakers and feed back).
export class MicrophoneInputSource implements PlaybackSource {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private eqFilterNode: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private pitchAnalyserNode: AnalyserNode | null = null;
  private startedAtMs = 0;
  private readonly timeUpdateCallbacks = new Set<(t: number) => void>();
  private timeUpdateHandle: ReturnType<typeof setInterval> | null = null;

  async load(): Promise<void> {
    // Default mic constraints are tuned for voice calls (noise suppression / echo cancellation /
    // auto-gain can flatten or suppress music — especially sustained bass tones misread as
    // "noise"). Disabled here since this is a music line-in use case, not a voice chat.
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    this.audioContext = new AudioContext();
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);

    this.eqFilterNode = this.audioContext.createBiquadFilter();
    this.eqFilterNode.type = "lowshelf";
    this.eqFilterNode.frequency.value = 100;
    this.eqFilterNode.gain.value = 0;

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;

    // Dedicated pitch-detection branch — see localAudioEngine.ts for why (isolates the bass
    // band from a full mix before monophonic pitch detection, separately from the user EQ).
    const pitchFilterNode = this.audioContext.createBiquadFilter();
    pitchFilterNode.type = "lowpass";
    pitchFilterNode.frequency.value = 250;
    pitchFilterNode.Q.value = 1;
    this.pitchAnalyserNode = this.audioContext.createAnalyser();
    this.pitchAnalyserNode.fftSize = 4096;

    this.sourceNode.connect(this.eqFilterNode);
    this.eqFilterNode.connect(this.analyserNode);
    this.eqFilterNode.connect(pitchFilterNode);
    pitchFilterNode.connect(this.pitchAnalyserNode);
    // analyserNode is deliberately not connected to destination yet — nothing is monitored
    // until play().
  }

  play(): void {
    if (!this.audioContext || !this.analyserNode) return;
    if (this.audioContext.state === "suspended") void this.audioContext.resume();
    this.analyserNode.connect(this.audioContext.destination);
    this.startedAtMs = this.startedAtMs || Date.now();
    this.startTimeUpdates();
  }

  pause(): void {
    if (!this.audioContext || !this.analyserNode) return;
    try {
      this.analyserNode.disconnect(this.audioContext.destination);
    } catch {
      // Already disconnected.
    }
    this.stopTimeUpdates();
  }

  seek(): void {
    // No-op: there is no transport to seek on a live external input.
  }

  setLoop(): void {
    // No-op: loop is not offered for mic input (see capabilities.ts supportsLoop).
  }

  clearLoop(): void {
    // No-op.
  }

  getCurrentTime(): number {
    return this.startedAtMs ? (Date.now() - this.startedAtMs) / 1000 : 0;
  }

  getDuration(): number {
    return 0;
  }

  onTimeUpdate(callback: (t: number) => void): () => void {
    this.timeUpdateCallbacks.add(callback);
    return () => this.timeUpdateCallbacks.delete(callback);
  }

  getCapabilities(): PlaybackCapabilities {
    return capabilitiesFor("mic");
  }

  getEqFilterNode(): BiquadFilterNode {
    if (!this.eqFilterNode) throw new Error("MicrophoneInputSource.load() must be called first");
    return this.eqFilterNode;
  }

  getAnalyserNode(): AnalyserNode {
    if (!this.analyserNode) throw new Error("MicrophoneInputSource.load() must be called first");
    return this.analyserNode;
  }

  getPitchAnalyserNode(): AnalyserNode {
    if (!this.pitchAnalyserNode) throw new Error("MicrophoneInputSource.load() must be called first");
    return this.pitchAnalyserNode;
  }

  dispose(): void {
    this.stopTimeUpdates();
    this.stream?.getTracks().forEach((track) => track.stop());
    void this.audioContext?.close();
  }

  private startTimeUpdates(): void {
    this.stopTimeUpdates();
    this.timeUpdateHandle = setInterval(() => {
      const t = this.getCurrentTime();
      for (const cb of this.timeUpdateCallbacks) cb(t);
    }, 250);
  }

  private stopTimeUpdates(): void {
    if (this.timeUpdateHandle !== null) {
      clearInterval(this.timeUpdateHandle);
      this.timeUpdateHandle = null;
    }
  }
}
