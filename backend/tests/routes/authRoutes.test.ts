import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/stores/userStore");
vi.mock("../../src/stores/sessionStore");
vi.mock("../../src/middleware/rateLimiter", () => ({
  loginRateLimiter: async (_c: unknown, next: () => Promise<void>) => next(),
}));

import { UserStore } from "../../src/stores/userStore";
import { SessionStore } from "../../src/stores/sessionStore";
import { hashPassword } from "../../src/logic/passwordHash";
import { app } from "../../src/app";

function postLogin(email: string, password: string) {
  return app.request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// vi.mock auto-mocks the class so `new UserStore()`/`new SessionStore()` call this
// implementation via `new` — it must be a function/class (not an arrow function) so returning
// an object here can override what the constructor produces.
function userStoreReturning(user: unknown) {
  return function () {
    return { findByEmail: vi.fn().mockResolvedValue(user), create: vi.fn() };
  } as unknown as typeof UserStore;
}

function sessionStoreWith(overrides: Partial<Record<"create" | "find" | "extend" | "delete", ReturnType<typeof vi.fn>>>) {
  return function () {
    return {
      create: vi.fn(),
      find: vi.fn(),
      extend: vi.fn(),
      delete: vi.fn(),
      ...overrides,
    };
  } as unknown as typeof SessionStore;
}

describe("authRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in with correct credentials and sets a session cookie", async () => {
    const passwordHash = await hashPassword("correct-password-1");
    vi.mocked(UserStore).mockImplementation(
      userStoreReturning({ userId: "u1", email: "a@example.com", passwordHash, createdAt: 0 }),
    );
    const sessionCreate = vi.fn();
    vi.mocked(SessionStore).mockImplementation(sessionStoreWith({ create: sessionCreate }));

    const res = await postLogin("a@example.com", "correct-password-1");

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("sessionId=");
    expect(sessionCreate).toHaveBeenCalledOnce();
  });

  it("rejects a wrong password with a generic 401", async () => {
    const passwordHash = await hashPassword("correct-password-1");
    vi.mocked(UserStore).mockImplementation(
      userStoreReturning({ userId: "u1", email: "a@example.com", passwordHash, createdAt: 0 }),
    );

    const res = await postLogin("a@example.com", "wrong-password-9");
    expect(res.status).toBe(401);
  });

  it("rejects an unknown email with the same generic 401 (no user enumeration)", async () => {
    const passwordHash = await hashPassword("correct-password-1");
    vi.mocked(UserStore).mockImplementation(
      userStoreReturning({ userId: "u1", email: "a@example.com", passwordHash, createdAt: 0 }),
    );
    const wrongPasswordRes = await postLogin("a@example.com", "wrong-password-9");
    const wrongPasswordBody = (await wrongPasswordRes.json()) as { error: string };

    vi.mocked(UserStore).mockImplementation(userStoreReturning(null));
    const unknownEmailRes = await postLogin("nobody@example.com", "whatever-123");
    const unknownEmailBody = (await unknownEmailRes.json()) as { error: string };

    expect(wrongPasswordRes.status).toBe(401);
    expect(unknownEmailRes.status).toBe(401);
    expect(wrongPasswordBody.error).toBe(unknownEmailBody.error);
  });

  it("logout clears the session cookie", async () => {
    const del = vi.fn();
    vi.mocked(SessionStore).mockImplementation(sessionStoreWith({ delete: del }));

    const res = await app.request("/auth/logout", {
      method: "POST",
      headers: { Cookie: "sessionId=s1" },
    });

    expect(res.status).toBe(200);
    expect(del).toHaveBeenCalledWith("s1");
  });
});
