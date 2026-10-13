import type { SongWorkspace } from "../services/songWorkspace";
import type { SyncOrchestrationService, SyncStatus } from "../services/syncOrchestrationService";
import type { LocalAudioEngine } from "../playback/localAudioEngine";
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
  syncService: SyncOrchestrationService;
  onError: (message: string) => void;
}

export function PlayerScreen({ workspace, syncService, onError }: Props) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const capabilities = workspace.source.getCapabilities();

  async function handleSave() {
    try {
      const status = await syncService.save(workspace);
      setSyncStatus(status);
    } catch {
      setSyncStatus("sync-failed");
      onError("保存中にエラーが発生しました");
    }
  }

  function handleMemoCommit(text: string) {
    const result = workspace.setMemoText(text);
    if (!result.valid) {
      onError(result.error);
      return;
    }
    void handleSave();
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
      <LoopControls
        loopEditor={workspace.loopEditor}
        capabilities={capabilities}
        getCurrentTime={() => workspace.source.getCurrentTime()}
      />
      {capabilities.supportsPitchDisplay && workspace.pitchDetector && (
        <PitchDisplay pitchDetector={workspace.pitchDetector} />
      )}
      {capabilities.supportsWaveform && workspace.waveform && (
        <WaveformCanvas
          waveformVisualizer={workspace.waveform}
          analyserNode={(workspace.source as LocalAudioEngine).getAnalyserNode()}
        />
      )}
      <MemoEditor initialText={workspace.getMemoText()} onCommit={handleMemoCommit} />
      <button type="button" data-testid="player-screen-save-button" onClick={() => void handleSave()}>
        保存
      </button>
      <SaveStatusIndicator status={syncStatus} />
    </div>
  );
}
