import type { SongWorkspaceState } from "../domain/types";

// Last-Write-Wins conflict resolution (see business-logic-model.md section 8, business-rules.md).
// remote wins iff it is strictly newer than local; ties keep local (idempotent re-merge of the
// same pair always yields the same result).
export function mergeLastWriteWins(
  local: SongWorkspaceState | null,
  remote: SongWorkspaceState | null,
): SongWorkspaceState | null {
  if (!local) return remote;
  if (!remote) return local;
  return remote.updatedAt > local.updatedAt ? remote : local;
}
