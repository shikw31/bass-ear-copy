import type { Session } from "../domain/types";
import { getCurrentSession } from "../api/authClient";
import { fetchSongData, saveSongData } from "../api/syncClient";
import { loadSongState, saveSongState } from "../logic/localStorageAdapter";
import { mergeLastWriteWins } from "../logic/mergeLastWriteWins";
import { nextBackoffDelayMs, RetryQueueManager } from "../logic/retryQueueManager";
import { isOnline, onNetworkRegained } from "../logic/networkStatusMonitor";
import type { SongWorkspace } from "./songWorkspace";

// SyncOrchestrationService (see services.md). Implements the offline-first save/load flow from
// business-logic-model.md section 8: always write locally first; sync to the backend only when
// logged in and online; queue + retry with backoff otherwise.
export type SyncStatus = "saved-locally" | "synced" | "sync-pending" | "sync-failed";

export class SyncOrchestrationService {
  private readonly retryQueue = new RetryQueueManager();
  private backoffMs = 0;
  private flushTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    onNetworkRegained(() => this.flushQueue());
  }

  async loadForCurrentUser(workspace: SongWorkspace): Promise<void> {
    const local = loadSongState(workspace.songKey);
    if (local) workspace.importState(local);

    const session = await this.safeGetSession();
    if (!session || !isOnline()) return;

    const remote = await fetchSongData(workspace.songKey).catch(() => null);
    const merged = mergeLastWriteWins(local, remote);
    if (merged) {
      workspace.importState(merged);
      saveSongState(merged);
    }
  }

  async save(workspace: SongWorkspace): Promise<SyncStatus> {
    const state = workspace.exportState();
    saveSongState(state);

    const session = await this.safeGetSession();
    if (!session || !isOnline()) {
      this.retryQueue.enqueue(state);
      return "saved-locally";
    }

    try {
      await saveSongData(state);
      this.retryQueue.dequeue(state.songKey);
      this.backoffMs = 0;
      return "synced";
    } catch {
      this.retryQueue.enqueue(state);
      this.scheduleFlush();
      return "sync-pending";
    }
  }

  async flushQueue(): Promise<void> {
    if (this.retryQueue.isEmpty()) return;
    const session = await this.safeGetSession();
    if (!session || !isOnline()) return;

    let anyFailed = false;
    for (const entry of this.retryQueue.entries()) {
      try {
        await saveSongData(entry.state);
        this.retryQueue.dequeue(entry.songKey);
      } catch {
        anyFailed = true;
      }
    }

    if (anyFailed) {
      this.scheduleFlush();
    } else {
      this.backoffMs = 0;
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimeoutHandle) return;
    this.backoffMs = nextBackoffDelayMs(this.backoffMs);
    this.flushTimeoutHandle = setTimeout(() => {
      this.flushTimeoutHandle = null;
      void this.flushQueue();
    }, this.backoffMs);
  }

  private async safeGetSession(): Promise<Session | null> {
    try {
      return await getCurrentSession();
    } catch {
      return null;
    }
  }
}
