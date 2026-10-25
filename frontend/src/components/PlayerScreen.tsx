import type { SongWorkspace } from "../services/songWorkspace";
import { TransportControls } from "./TransportControls";
import { SpeedControl } from "./SpeedControl";
import { EQControl } from "./EQControl";
import { LoopControls } from "./LoopControls";
import { PitchDisplay } from "./PitchDisplay";
import { WaveformCanvas } from "./WaveformCanvas";
import { MemoEditor } from "./MemoEditor";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useState } from "react";

interface Props {
  workspace: SongWorkspace;
  onError: (message: string) => void;
}

export function PlayerScreen({ workspace, onError }: Props) {
  const [saved, setSaved] = useState(false);
  const capabilities = workspace.source.getCapabilities();
  const isMic = workspace.sourceType === "mic";

  function handleSave() {
    try {
      workspace.saveLocal();
      setSaved(true);
    } catch {
      onError("保存中にエラーが発生しました");
    }
  }

  function handleMemoCommit(text: string) {
    const result = workspace.setMemoText(text);
    if (!result.valid) {
      onError(result.error);
      return;
    }
    handleSave();
  }

  function handleRateChange(rate: number) {
    if (workspace.timeStretch) {
      workspace.timeStretch.setRate(rate);
    } else if ("setPlaybackRate" in workspace.source) {
      (workspace.source as unknown as { setPlaybackRate(rate: number): void }).setPlaybackRate(rate);
    }
  }

  return (
    <div data-testid="player-screen" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isMic && (
        <div className="mic-hint" data-testid="player-screen-mic-hint">
          <span className="led led--red" aria-hidden="true" />
          マイクでモニター中です。別の端末でYouTube等を再生してください（ヘッドホン推奨）。
        </div>
      )}

      <div className="panel">
        <span className="panel__label">Transport</span>
        <TransportControls
          playbackSource={workspace.source}
          autoPlay={isMic}
          playLabel={isMic ? "モニター開始" : undefined}
          pauseLabel={isMic ? "モニター停止" : undefined}
        />
        {capabilities.supportsSpeedChange && (
          <div className="panel__row">
            <SpeedControl onRateChange={handleRateChange} />
          </div>
        )}
      </div>

      {capabilities.supportsEQ && workspace.eq && (
        <div className="panel">
          <span className="panel__label">Tone</span>
          <EQControl eqProcessor={workspace.eq} />
        </div>
      )}

      {capabilities.supportsLoop && (
        <div className="panel">
          <span className="panel__label">Loop</span>
          <LoopControls
            loopEditor={workspace.loopEditor}
            capabilities={capabilities}
            getCurrentTime={() => workspace.source.getCurrentTime()}
          />
        </div>
      )}

      {((capabilities.supportsPitchDisplay && workspace.pitchDetector) ||
        (capabilities.supportsWaveform && workspace.waveform && workspace.getAnalyserNode())) && (
        <div className="panel">
          <span className="panel__label">Tuner / Scope</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {capabilities.supportsPitchDisplay && workspace.pitchDetector && (
              <PitchDisplay pitchDetector={workspace.pitchDetector} />
            )}
            {capabilities.supportsWaveform && workspace.waveform && workspace.getAnalyserNode() && (
              <WaveformCanvas waveformVisualizer={workspace.waveform} analyserNode={workspace.getAnalyserNode()!} />
            )}
          </div>
        </div>
      )}

      <div className="panel">
        <span className="panel__label">Notes</span>
        <MemoEditor initialText={workspace.getMemoText()} onCommit={handleMemoCommit} />
        <div className="panel__row" style={{ marginTop: 12 }}>
          <button type="button" className="btn btn--accent" data-testid="player-screen-save-button" onClick={handleSave}>
            保存
          </button>
          <SaveStatusIndicator saved={saved} />
        </div>
      </div>
    </div>
  );
}
