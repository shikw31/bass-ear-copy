import { useRef, useState } from "react";
import { openInput, openMicInput } from "./services/playbackOrchestrationService";
import type { SongWorkspace } from "./services/songWorkspace";
import { InputScreen } from "./components/InputScreen";
import { PlayerScreen } from "./components/PlayerScreen";
import { ErrorToast } from "./components/ErrorToast";

export function App() {
  const [workspace, setWorkspace] = useState<SongWorkspace | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);

  async function handleOpenInput(input: File | string) {
    try {
      workspace?.dispose();
      const next = await openInput(input, youtubeContainerRef.current);
      next.loadLocal();
      setWorkspace(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "曲の読み込みに失敗しました");
    }
  }

  async function handleOpenMicInput() {
    try {
      workspace?.dispose();
      const next = await openMicInput();
      next.loadLocal();
      setWorkspace(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "マイクの起動に失敗しました");
    }
  }

  return (
    <div data-testid="app-root">
      <div
        ref={youtubeContainerRef}
        data-testid="youtube-player-container"
        style={{ display: workspace?.sourceType === "youtube" ? "block" : "none" }}
      />
      {!workspace && (
        <InputScreen
          onOpenLocalFile={handleOpenInput}
          onOpenYouTubeUrl={handleOpenInput}
          onOpenMicInput={handleOpenMicInput}
          onError={setErrorMessage}
        />
      )}
      {workspace && <PlayerScreen workspace={workspace} onError={setErrorMessage} />}
      <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
    </div>
  );
}
