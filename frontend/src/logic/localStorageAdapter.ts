import type { SongWorkspaceState, SyncQueueEntry } from "../domain/types";

// LocalStorageAdapter (see nfr-design/logical-components.md). All access is wrapped in
// try/catch: localStorage can throw (private browsing, quota, disabled site data) and the app
// must keep working without it (see artifact-capabilities-style guidance for browser storage).

const STATE_PREFIX = "bass-ear-copy:song:";
const QUEUE_KEY = "bass-ear-copy:sync-queue";

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

export function loadSyncQueue(): SyncQueueEntry[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncQueueEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveSyncQueue(queue: SyncQueueEntry[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Best-effort.
  }
}
