import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/stores/sessionStore");
vi.mock("../../src/stores/songRecordStore");

import { SessionStore } from "../../src/stores/sessionStore";
import { SongRecordStore } from "../../src/stores/songRecordStore";
import { app } from "../../src/app";

const SONG_KEY = `local:${"a".repeat(64)}`;

// See authRoutes.test.ts for why these are `function`s rather than arrow functions.
function mockValidSession(userId = "u1") {
  vi.mocked(SessionStore).mockImplementation(function () {
    return {
      find: vi.fn().mockResolvedValue({ sessionId: "s1", userId, createdAt: 0, expiresAt: Date.now() + 100_000 }),
      extend: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };
  } as unknown as typeof SessionStore);
}

function songRecordStoreWith(overrides: { find?: ReturnType<typeof vi.fn>; save?: ReturnType<typeof vi.fn> }) {
  return function () {
    return { find: vi.fn(), save: vi.fn(), ...overrides };
  } as unknown as typeof SongRecordStore;
}

describe("songsRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without a session cookie (deny-by-default)", async () => {
    const res = await app.request(`/songs/${SONG_KEY}`);
    expect(res.status).toBe(401);
  });

  it("GET returns 404 when no record exists for this user", async () => {
    mockValidSession();
    vi.mocked(SongRecordStore).mockImplementation(songRecordStoreWith({ find: vi.fn().mockResolvedValue(null) }));

    const res = await app.request(`/songs/${SONG_KEY}`, { headers: { Cookie: "sessionId=s1" } });
    expect(res.status).toBe(404);
  });

  it("PUT saves a new record and strips userId from the response", async () => {
    mockValidSession();
    const save = vi.fn();
    vi.mocked(SongRecordStore).mockImplementation(
      songRecordStoreWith({ find: vi.fn().mockResolvedValue(null), save }),
    );

    const body = { songKey: SONG_KEY, loopPoints: null, memo: null, updatedAt: 1 };
    const res = await app.request(`/songs/${SONG_KEY}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: "sessionId=s1" },
      body: JSON.stringify(body),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json).toEqual(body);
    expect("userId" in json).toBe(false);
    expect(save).toHaveBeenCalledWith({ userId: "u1", ...body });
  });

  it("PUT returns 409 + the server's existing data when the write is stale (server-enforced LWW)", async () => {
    mockValidSession();
    const existing = { userId: "u1", songKey: SONG_KEY, loopPoints: null, memo: null, updatedAt: 100 };
    vi.mocked(SongRecordStore).mockImplementation(
      songRecordStoreWith({ find: vi.fn().mockResolvedValue(existing) }),
    );

    const staleBody = { songKey: SONG_KEY, loopPoints: null, memo: null, updatedAt: 1 };
    const res = await app.request(`/songs/${SONG_KEY}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: "sessionId=s1" },
      body: JSON.stringify(staleBody),
    });

    expect(res.status).toBe(409);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.updatedAt).toBe(100);
    expect("userId" in json).toBe(false);
  });

  it("scopes GET to the authenticated user's own records only", async () => {
    mockValidSession("u1");
    const find = vi.fn().mockResolvedValue(null);
    vi.mocked(SongRecordStore).mockImplementation(songRecordStoreWith({ find }));

    await app.request(`/songs/${SONG_KEY}`, { headers: { Cookie: "sessionId=s1" } });

    expect(find).toHaveBeenCalledWith("u1", SONG_KEY);
  });
});
