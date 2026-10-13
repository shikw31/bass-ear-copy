import { useEffect, useRef, useState } from "react";
import type { Session } from "./domain/types";
import { getCurrentSession } from "./api/authClient";
import { openInput } from "./services/playbackOrchestrationService";
import { SyncOrchestrationService } from "./services/syncOrchestrationService";
import type { SongWorkspace } from "./services/songWorkspace";
import { AuthBar } from "./components/AuthBar";
import { InputScreen } from "./components/InputScreen";
import { PlayerScreen } from "./components/PlayerScreen";
import { ErrorToast } from "./components/ErrorToast";

const syncService = new SyncOrchestrationService();

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<SongWorkspace | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentSession()
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  async function handleOpenInput(input: File | string) {
    try {
      workspace?.dispose();
      const next = await openInput(input, youtubeContainerRef.current);
      await syncService.loadForCurrentUser(next);
      setWorkspace(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "曲の読み込みに失敗しました");
    }
  }

  return (
    <div data-testid="app-root">
      <AuthBar session={session} onSessionChange={setSession} onError={setErrorMessage} />
      <div
        ref={youtubeContainerRef}
        data-testid="youtube-player-container"
        style={{ display: workspace?.sourceType === "youtube" ? "block" : "none" }}
      />
      {!workspace && (
        <InputScreen
          onOpenLocalFile={handleOpenInput}
          onOpenYouTubeUrl={handleOpenInput}
          onError={setErrorMessage}
        />
      )}
      {workspace && (
        <PlayerScreen workspace={workspace} syncService={syncService} onError={setErrorMessage} />
      )}
      <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
    </div>
  );
}
