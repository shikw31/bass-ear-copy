import { useEffect, useRef, useState } from "react";
import type { WaveformVisualizer, WaveformMode } from "../playback/waveformVisualizer";

interface Props {
  waveformVisualizer: WaveformVisualizer;
  analyserNode: AnalyserNode;
}

export function WaveformCanvas({ waveformVisualizer, analyserNode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<WaveformMode>("waveform");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    waveformVisualizer.attach(analyserNode, canvas);
    return () => waveformVisualizer.detach();
  }, [waveformVisualizer, analyserNode]);

  function toggleMode() {
    const next = mode === "waveform" ? "spectrogram" : "waveform";
    setMode(next);
    waveformVisualizer.setMode(next);
  }

  return (
    <div data-testid="waveform-canvas">
      <canvas ref={canvasRef} width={480} height={120} data-testid="waveform-canvas-element" />
      <button type="button" data-testid="waveform-canvas-mode-toggle-button" onClick={toggleMode}>
        表示切替（{mode === "waveform" ? "波形" : "スペクトログラム"}）
      </button>
    </div>
  );
}
