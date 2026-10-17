import { createMiddleware } from "hono/factory";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SessionStore } from "../stores/sessionStore";
import { isExpired, SESSION_DURATION_MS, withSlidingExtension } from "../logic/session";

export const SESSION_COOKIE_NAME = "sessionId";

export type AuthVariables = {
  userId: string;
};

// AuthMiddleware (see logical-components.md): deny-by-default access control for /songs/*
// (SECURITY-08). On success, extends the session (sliding expiration) and refreshes the cookie.
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (!sessionId) {
    return c.json({ error: "認証が必要です" }, 401);
  }

  const sessionStore = new SessionStore();
  const session = await sessionStore.find(sessionId);
  const now = Date.now();

  if (!session || isExpired(session, now)) {
    deleteCookie(c, SESSION_COOKIE_NAME);
    return c.json({ error: "認証が必要です" }, 401);
  }

  const extended = withSlidingExtension(session, now);
  await sessionStore.extend(extended, now);
  setCookie(c, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  c.set("userId", session.userId);
  await next();
});
