import type { SongWorkspace } from "../services/songWorkspace";
import type { PitchResult, TranscriptEntry } from "../domain/types";
import { TransportControls } from "./TransportControls";
import { SpeedControl } from "./SpeedControl";
import { EQControl } from "./EQControl";
import { LoopControls } from "./LoopControls";
import { PitchDisplay } from "./PitchDisplay";
import { ChordDisplay } from "./ChordDisplay";
import { WaveformCanvas } from "./WaveformCanvas";
import { MemoEditor } from "./MemoEditor";
import { TranscriptLog } from "./TranscriptLog";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useState } from "react";

interface Props {
  workspace: SongWorkspace;
  onError: (message: string) => void;
  onBack: () => void;
}

export function PlayerScreen({ workspace, onError, onBack }: Props) {
  const [saved, setSaved] = useState(false);
  const [memoVersion, setMemoVersion] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(workspace.getTranscript());
  const [capabilities, setCapabilities] = useState(workspace.source.getCapabilities());
  const [enablingAnalysis, setEnablingAnalysis] = useState(false);
  const isMic = workspace.sourceType === "mic";
  const isYoutube = workspace.sourceType === "youtube";

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

  function handlePitchUpdate(pitch: PitchResult) {
    workspace.observePitch(pitch);
    setTranscript(workspace.getTranscript());
  }

  function handleClearTranscript() {
    workspace.clearTranscript();
    setTranscript(workspace.getTranscript());
  }

  function handleCopyTranscriptToMemo(transcriptText: string) {
    const existing = workspace.getMemoText();
    const combined = existing ? `${existing}\n\n— 採譜ログ —\n${transcriptText}` : `— 採譜ログ —\n${transcriptText}`;
    const result = workspace.setMemoText(combined);
    if (!result.valid) {
      onError(result.error);
      return;
    }
    handleSave();
    setMemoVersion((v) => v + 1);
  }

  async function handleEnableAnalysis() {
    setEnablingAnalysis(true);
    try {
      await workspace.enableYoutubeAnalysis();
      setCapabilities(workspace.source.getCapabilities());
    } catch (error) {
      onError(error instanceof Error ? error.message : "タブ音声の共有に失敗しました");
    } finally {
      setEnablingAnalysis(false);
    }
  }

  const showAnalysisPanel =
    (capabilities.supportsPitchDisplay && workspace.pitchDetector) ||
    (capabilities.supportsWaveform && workspace.waveform && workspace.getAnalyserNode()) ||
    (capabilities.supportsChord && workspace.chordDetector);

  return (
    <div data-testid="player-screen" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        className="btn"
        data-testid="player-screen-back-button"
        onClick={onBack}
        style={{ alignSelf: "flex-start" }}
      >
        ← 最初の画面に戻る
      </button>

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

      {isYoutube && !capabilities.supportsPitchDisplay && (
        <div className="panel">
          <span className="panel__label">Tuner / Scope</span>
          <p className="panel__hint">
            このタブの音声を共有すると、音程表示・波形表示・コード推測（参考）が使えるようになります（聞こえる音自体は変わりません。共有ダイアログで「このタブ」と「タブの音声を共有」を選んでください）。
          </p>
          <button type="button" className="btn" onClick={handleEnableAnalysis} disabled={enablingAnalysis}>
            {enablingAnalysis ? "共有中…" : "タブの音声を解析用に共有"}
          </button>
        </div>
      )}

      {showAnalysisPanel && (
        <div className="panel">
          <span className="panel__label">Tuner / Scope</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {capabilities.supportsPitchDisplay && workspace.pitchDetector && (
              <PitchDisplay pitchDetector={workspace.pitchDetector} onPitchUpdate={handlePitchUpdate} />
            )}
            {capabilities.supportsChord && workspace.chordDetector && (
              <ChordDisplay chordDetector={workspace.chordDetector} />
            )}
            {capabilities.supportsWaveform && workspace.waveform && workspace.getAnalyserNode() && (
              <WaveformCanvas waveformVisualizer={workspace.waveform} analyserNode={workspace.getAnalyserNode()!} />
            )}
          </div>
        </div>
      )}

      {capabilities.supportsPitchDisplay && (
        <div className="panel">
          <span className="panel__label">Transcript</span>
          <TranscriptLog entries={transcript} onClear={handleClearTranscript} onCopyToMemo={handleCopyTranscriptToMemo} />
        </div>
      )}

      <div className="panel">
        <span className="panel__label">Notes</span>
        <MemoEditor key={memoVersion} initialText={workspace.getMemoText()} onCommit={handleMemoCommit} />
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
