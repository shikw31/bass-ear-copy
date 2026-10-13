import type { SongWorkspaceState, SyncQueueEntry } from "../domain/types";
import { loadSyncQueue, saveSyncQueue } from "./localStorageAdapter";

// RetryQueueManager (see nfr-design-patterns.md: exponential backoff, no max attempts).
// One queue entry per songKey — a newer local save overwrites the older queued one.

const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

export function nextBackoffDelayMs(previousDelayMs: number): number {
  if (previousDelayMs <= 0) return INITIAL_DELAY_MS;
  return Math.min(MAX_DELAY_MS, previousDelayMs * 2);
}

export class RetryQueueManager {
  private queue: SyncQueueEntry[];

  constructor() {
    this.queue = loadSyncQueue();
  }

  enqueue(state: SongWorkspaceState): void {
    this.queue = [
      ...this.queue.filter((entry) => entry.songKey !== state.songKey),
      { songKey: state.songKey, state, queuedAt: Date.now() },
    ];
    saveSyncQueue(this.queue);
  }

  dequeue(songKey: string): void {
    this.queue = this.queue.filter((entry) => entry.songKey !== songKey);
    saveSyncQueue(this.queue);
  }

  entries(): SyncQueueEntry[] {
    return this.queue;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
