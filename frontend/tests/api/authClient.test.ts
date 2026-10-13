import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentSession, login, logout } from "../../src/api/authClient";

describe("authClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("login sends credentials and returns the session on success", async () => {
    const session = { userId: "u1", expiresAt: 123 };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => session });
    vi.stubGlobal("fetch", fetchMock);

    const result = await login({ email: "a@example.com", password: "secret" });

    expect(result).toEqual(session);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.credentials).toBe("include");
  });

  it("login throws on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(login({ email: "a@example.com", password: "wrong" })).rejects.toThrow();
  });

  it("getCurrentSession returns null on 401 (not logged in)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    expect(await getCurrentSession()).toBeNull();
  });

  it("logout calls the logout endpoint with credentials included", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await logout();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });
});
