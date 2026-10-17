import type { SongRecord } from "../domain/types";

// Server-enforced Last-Write-Wins (see business-logic-model.md section 5, business-rules.md).
// A write is accepted iff there is no existing record, or the incoming record is not strictly
// older than the existing one (ties are accepted — a resubmission of the same state succeeds).
export function shouldAcceptWrite(existing: SongRecord | null, incoming: SongRecord): boolean {
  if (!existing) return true;
  return incoming.updatedAt >= existing.updatedAt;
}
