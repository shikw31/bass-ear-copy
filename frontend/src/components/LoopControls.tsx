import { useState } from "react";
import type { LoopEditor } from "../playback/loopEditor";
import type { PlaybackCapabilities } from "../domain/types";

interface Props {
  loopEditor: LoopEditor;
  capabilities: PlaybackCapabilities;
  getCurrentTime: () => number;
}

export function LoopControls({ loopEditor, capabilities, getCurrentTime }: Props) {
  const [points, setPoints] = useState(loopEditor.getLoopPoints());
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setA() {
    const ok = loopEditor.setPointA(getCurrentTime());
    setError(ok ? null : loopEditor.getLastError());
    setPoints(loopEditor.getLoopPoints());
  }

  function setB() {
    const ok = loopEditor.setPointB(getCurrentTime());
    setError(ok ? null : loopEditor.getLastError());
    setPoints(loopEditor.getLoopPoints());
  }

  function toggleLoop() {
    const next = !enabled;
    loopEditor.enableLoop(next);
    setEnabled(next);
  }

  return (
    <div data-testid="loop-controls">
      <div className="panel__row">
        <button type="button" className="btn" data-testid="loop-controls-set-a-button" onClick={setA}>
          A点をセット
        </button>
        <button type="button" className="btn" data-testid="loop-controls-set-b-button" onClick={setB}>
          B点をセット
        </button>
        {points && (
          <span className="readout readout--sm" data-testid="loop-controls-points-label">
            {points.a.toFixed(1)}s 〜 {points.b.toFixed(1)}s
          </span>
        )}
      </div>
      <div className="panel__row">
        <button
          type="button"
          className="toggle"
          data-on={enabled}
          data-testid="loop-controls-toggle-button"
          aria-label={enabled ? "ループOFF" : "ループON"}
          onClick={toggleLoop}
          disabled={!points}
        />
        <span className="field-label" style={{ margin: 0 }}>
          {enabled ? "ループ ON" : "ループ OFF"}
        </span>
        {capabilities.loopPrecision === "approximate" && (
          <span className="panel__hint" data-testid="loop-controls-precision-note">
            ※簡易ループ（数百ms程度の誤差があります）
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="panel__hint" data-testid="loop-controls-error" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
