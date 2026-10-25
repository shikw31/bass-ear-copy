import type { SongWorkspaceState } from "../domain/types";

// LocalStorageAdapter (see nfr-design/logical-components.md). All access is wrapped in
// try/catch: localStorage can throw (private browsing, quota, disabled site data) and the app
// must keep working without it (see artifact-capabilities-style guidance for browser storage).

const STATE_PREFIX = "bass-ear-copy:song:";

export function loadSongState(songKey: string): SongWorkspaceState | null {
  try {
    const raw = localStorage.getItem(STATE_PREFIX + songKey);
    return raw ? (JSON.parse(raw) as SongWorkspaceState) : null;
  } catch {
    return null;
  }
}

export function saveSongState(state: SongWorkspaceState): void {
  try {
    localStorage.setItem(STATE_PREFIX + state.songKey, JSON.stringify(state));
  } catch {
    // Best-effort: if storage is unavailable, the in-memory state still works for this session.
  }
}
