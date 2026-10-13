import { afterEach, describe, expect, it, vi } from "vitest";
import type { SongWorkspaceState } from "../../src/domain/types";
import { ConflictError, fetchSongData, saveSongData } from "../../src/api/syncClient";

const sampleState: SongWorkspaceState = {
  songKey: "local:abc",
  loopPoints: { a: 1, b: 2, enabled: true },
  memo: { text: "note", updatedAt: 1 },
  updatedAt: 1,
};

describe("syncClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchSongData returns null when not found (404)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await fetchSongData("local:abc")).toBeNull();
  });

  it("fetchSongData returns null when unauthenticated (401), per offline-first fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    expect(await fetchSongData("local:abc")).toBeNull();
  });

  it("fetchSongData returns parsed state on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => sampleState }));
    expect(await fetchSongData("local:abc")).toEqual(sampleState);
  });

  it("saveSongData PUTs to the song's own key with credentials included", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await saveSongData(sampleState);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain(encodeURIComponent(sampleState.songKey));
    expect(options.method).toBe("PUT");
    expect(options.credentials).toBe("include");
    expect(JSON.parse(options.body)).toEqual(sampleState);
  });

  it("saveSongData throws on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(saveSongData(sampleState)).rejects.toThrow();
  });

  it("saveSongData throws ConflictError carrying the server's newer state on 409", async () => {
    const serverState: SongWorkspaceState = { ...sampleState, updatedAt: 999 };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => serverState }),
    );

    await expect(saveSongData(sampleState)).rejects.toBeInstanceOf(ConflictError);
    try {
      await saveSongData(sampleState);
    } catch (error) {
      expect((error as ConflictError).existing).toEqual(serverState);
    }
  });
});
