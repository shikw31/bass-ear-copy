import { startThrottledLoop } from "./audioAnalysisLoop";

const TARGET_FPS = 30;

export type WaveformMode = "waveform" | "spectrogram";

// WaveformVisualizer (see components.md). Renders a live view from the AnalyserNode rather than
// a static full-file waveform, keeping it simple and in step with the pitch detector's analysis
// source (see localAudioEngine.ts's shared AnalyserNode).
export class WaveformVisualizer {
  private analyserNode: AnalyserNode | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private mode: WaveformMode = "waveform";
  private stopLoop: (() => void) | null = null;

  attach(analyserNode: AnalyserNode, canvas: HTMLCanvasElement): void {
    this.analyserNode = analyserNode;
    this.canvas = canvas;
    this.stopLoop = startThrottledLoop(1000 / TARGET_FPS, () => this.renderFrame());
  }

  setMode(mode: WaveformMode): void {
    this.mode = mode;
  }

  detach(): void {
    this.stopLoop?.();
    this.stopLoop = null;
  }

  private renderFrame(): void {
    const analyser = this.analyserNode;
    const canvas = this.canvas;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.mode === "waveform") {
      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);
      ctx.strokeStyle = "#ffa63d";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(255, 166, 61, 0.55)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * canvas.width;
        const y = (0.5 - data[i] / 2) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);
      const barWidth = canvas.width / freqData.length;
      for (let i = 0; i < freqData.length; i++) {
        const barHeight = (freqData[i] / 255) * canvas.height;
        const t = freqData[i] / 255;
        ctx.fillStyle = t > 0.75 ? "#39d6c6" : "#ffa63d";
        ctx.fillRect(i * barWidth, canvas.height - barHeight, Math.max(1, barWidth - 1), barHeight);
      }
    }
  }
}
