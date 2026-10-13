import type { Session, SongWorkspaceState } from "../domain/types";
import { getCurrentSession } from "../api/authClient";
import { ConflictError, fetchSongData, saveSongData } from "../api/syncClient";
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
    } catch (error) {
      if (error instanceof ConflictError) {
        // Server already holds a newer record (backend-enforced Last-Write-Wins — see
        // backend-sync-api/functional-design/business-logic-model.md section 6). Our write can
        // never succeed by retrying, so adopt the server's state instead of queuing forever.
        this.adoptServerState(workspace, error.existing);
        this.retryQueue.dequeue(state.songKey);
        return "synced";
      }
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
      } catch (error) {
        if (error instanceof ConflictError) {
          const merged = mergeLastWriteWins(entry.state, error.existing);
          if (merged) saveSongState(merged);
          this.retryQueue.dequeue(entry.songKey);
        } else {
          anyFailed = true;
        }
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

  private adoptServerState(workspace: SongWorkspace, serverState: SongWorkspaceState): void {
    const merged = mergeLastWriteWins(workspace.exportState(), serverState);
    if (!merged) return;
    saveSongState(merged);
    workspace.importState(merged);
  }

  private async safeGetSession(): Promise<Session | null> {
    try {
      return await getCurrentSession();
    } catch {
      return null;
    }
  }
}
