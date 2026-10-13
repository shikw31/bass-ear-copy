import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { SongWorkspaceState } from "../../src/domain/types";
import { mergeLastWriteWins } from "../../src/logic/mergeLastWriteWins";

function stateAt(updatedAt: number): SongWorkspaceState {
  return { songKey: "local:abc", loopPoints: null, memo: null, updatedAt };
}

describe("mergeLastWriteWins (PBT-03 invariant, PBT-04 idempotence)", () => {
  it("remote wins iff strictly newer than local", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        (localTime, remoteTime) => {
          const result = mergeLastWriteWins(stateAt(localTime), stateAt(remoteTime));
          const expected = remoteTime > localTime ? remoteTime : localTime;
          expect(result?.updatedAt).toBe(expected);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("merging the same pair twice yields the same result (idempotent)", () => {
    const local = stateAt(100);
    const remote = stateAt(200);
    const first = mergeLastWriteWins(local, remote);
    const second = mergeLastWriteWins(local, remote);
    expect(first).toEqual(second);
  });

  it("handles null local or remote", () => {
    const remote = stateAt(200);
    expect(mergeLastWriteWins(null, remote)).toBe(remote);
    const local = stateAt(100);
    expect(mergeLastWriteWins(local, null)).toBe(local);
    expect(mergeLastWriteWins(null, null)).toBeNull();
  });
});
