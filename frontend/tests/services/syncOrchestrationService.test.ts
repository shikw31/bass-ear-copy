import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session, SongWorkspaceState } from "../../src/domain/types";
import type { PlaybackSource } from "../../src/playback/playbackSource";

vi.mock("../../src/api/authClient", () => ({
  getCurrentSession: vi.fn(),
}));
vi.mock("../../src/api/syncClient", async () => {
  const actual = await vi.importActual<typeof import("../../src/api/syncClient")>(
    "../../src/api/syncClient",
  );
  return { ...actual, saveSongData: vi.fn(), fetchSongData: vi.fn() };
});
vi.mock("../../src/logic/networkStatusMonitor", () => ({
  isOnline: vi.fn().mockReturnValue(true),
  onNetworkRegained: vi.fn().mockReturnValue(() => {}),
}));

import { getCurrentSession } from "../../src/api/authClient";
import { ConflictError, saveSongData } from "../../src/api/syncClient";
import { SyncOrchestrationService } from "../../src/services/syncOrchestrationService";
import { SongWorkspace } from "../../src/services/songWorkspace";

function fakeYoutubeSource(): PlaybackSource {
  return {
    load: async () => {},
    play: () => {},
    pause: () => {},
    seek: () => {},
    setLoop: () => {},
    clearLoop: () => {},
    getCurrentTime: () => 0,
    getDuration: () => 100,
    onTimeUpdate: () => () => {},
    getCapabilities: () => ({
      supportsEQ: false,
      supportsPitchDisplay: false,
      supportsWaveform: false,
      supportsSpeedChange: true,
      loopPrecision: "approximate",
    }),
    dispose: () => {},
  };
}

const session: Session = { userId: "u1", expiresAt: Date.now() + 1000 };

describe("SyncOrchestrationService conflict handling (server-enforced Last-Write-Wins)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getCurrentSession).mockResolvedValue(session);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("adopts the server's newer state on a 409 instead of retrying forever", async () => {
    const workspace = new SongWorkspace({
      songKey: "yt:abc",
      sourceType: "youtube",
      source: fakeYoutubeSource(),
    });
    workspace.setMemoText("my local note");

    const serverState: SongWorkspaceState = {
      songKey: "yt:abc",
      loopPoints: null,
      memo: { text: "newer note from another device", updatedAt: Date.now() + 1_000_000 },
      updatedAt: Date.now() + 1_000_000,
    };
    vi.mocked(saveSongData).mockRejectedValueOnce(new ConflictError(serverState));

    const service = new SyncOrchestrationService();
    const status = await service.save(workspace);

    expect(status).toBe("synced");
    expect(workspace.getMemoText()).toBe("newer note from another device");
    expect(service["retryQueue"].isEmpty()).toBe(true); // not left queued for endless retry
  });
});
