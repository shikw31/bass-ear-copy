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
    <div data-testid="player-screen">
      <TransportControls playbackSource={workspace.source} />
      {capabilities.supportsSpeedChange && <SpeedControl onRateChange={handleRateChange} />}
      {capabilities.supportsEQ && workspace.eq && <EQControl eqProcessor={workspace.eq} />}
      {capabilities.supportsLoop && (
        <LoopControls
          loopEditor={workspace.loopEditor}
          capabilities={capabilities}
          getCurrentTime={() => workspace.source.getCurrentTime()}
        />
      )}
      {capabilities.supportsPitchDisplay && workspace.pitchDetector && (
        <PitchDisplay pitchDetector={workspace.pitchDetector} />
      )}
      {capabilities.supportsWaveform && workspace.waveform && workspace.getAnalyserNode() && (
        <WaveformCanvas waveformVisualizer={workspace.waveform} analyserNode={workspace.getAnalyserNode()!} />
      )}
      <MemoEditor initialText={workspace.getMemoText()} onCommit={handleMemoCommit} />
      <button type="button" data-testid="player-screen-save-button" onClick={handleSave}>
        保存
      </button>
      <SaveStatusIndicator saved={saved} />
    </div>
  );
}
