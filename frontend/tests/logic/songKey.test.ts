import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { extractYouTubeVideoId, songKeyForLocalFile, songKeyForYouTubeUrl } from "../../src/logic/songKey";

describe("songKeyForLocalFile (PBT-02/03: idempotence/determinism)", () => {
  it("returns the same key for identical file content (example-based)", async () => {
    const fileA = new File(["hello bass"], "a.mp3", { type: "audio/mpeg" });
    const fileB = new File(["hello bass"], "b.mp3", { type: "audio/mpeg" });
    expect(await songKeyForLocalFile(fileA)).toBe(await songKeyForLocalFile(fileB));
  });

  it("is deterministic for arbitrary byte content", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array({ minLength: 1, maxLength: 200 }), async (bytes) => {
        const file = new File([bytes], "f.wav", { type: "audio/wav" });
        const key1 = await songKeyForLocalFile(file);
        const key2 = await songKeyForLocalFile(file);
        expect(key1).toBe(key2);
        expect(key1.startsWith("local:")).toBe(true);
      }),
      { numRuns: 25 },
    );
  });
});

describe("songKeyForYouTubeUrl (PBT-03: invariant under query-string differences)", () => {
  it("extracts the same videoId regardless of extra query params", () => {
    const base = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const withList = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&index=2";
    const short = "https://youtu.be/dQw4w9WgXcQ";

    expect(songKeyForYouTubeUrl(base)).toBe("yt:dQw4w9WgXcQ");
    expect(songKeyForYouTubeUrl(withList)).toBe("yt:dQw4w9WgXcQ");
    expect(songKeyForYouTubeUrl(short)).toBe("yt:dQw4w9WgXcQ");
  });

  it("returns null for non-YouTube URLs", () => {
    expect(extractYouTubeVideoId("https://example.com/video")).toBeNull();
    expect(songKeyForYouTubeUrl("https://example.com/video")).toBeNull();
  });
});
