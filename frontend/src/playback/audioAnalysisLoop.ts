// AudioAnalysisLoop (see nfr-design/logical-components.md): a requestAnimationFrame-driven
// ticker throttled to a target interval, shared by PitchDetector (10-20Hz) and
// WaveformVisualizer (30fps) so neither does full-rate per-frame work (NFR performance pattern).
export function startThrottledLoop(intervalMs: number, callback: () => void): () => void {
  let rafHandle: number;
  let lastRunMs = 0;

  const tick = (nowMs: number) => {
    if (nowMs - lastRunMs >= intervalMs) {
      lastRunMs = nowMs;
      callback();
    }
    rafHandle = requestAnimationFrame(tick);
  };

  rafHandle = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafHandle);
}
