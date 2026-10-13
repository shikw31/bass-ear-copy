import type { SongWorkspaceState } from "../domain/types";

// SyncClient (see component-methods.md). Talks to Backend Sync API's SongDataService via
// AppBackendAPI; relies on the session cookie (see authClient.ts) for authorization.

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL ?? "";

// Thrown when the backend rejects a write because it already holds a newer record (server-side
// Last-Write-Wins — see backend-sync-api/functional-design/business-logic-model.md section 5).
// Carries the server's current record so the caller can merge instead of retrying forever.
export class ConflictError extends Error {
  constructor(public readonly existing: SongWorkspaceState) {
    super("サーバー側により新しいデータが保存されているため、書き込みが競合しました");
  }
}

export async function fetchSongData(songKey: string): Promise<SongWorkspaceState | null> {
  const response = await fetch(`${BASE_URL}/songs/${encodeURIComponent(songKey)}`, {
    credentials: "include",
  });
  if (response.status === 404 || response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("曲データの取得に失敗しました");
  }
  return (await response.json()) as SongWorkspaceState;
}

export async function saveSongData(data: SongWorkspaceState): Promise<void> {
  const response = await fetch(`${BASE_URL}/songs/${encodeURIComponent(data.songKey)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (response.status === 409) {
    const existing = (await response.json()) as SongWorkspaceState;
    throw new ConflictError(existing);
  }
  if (!response.ok) {
    throw new Error("曲データの保存に失敗しました");
  }
}
