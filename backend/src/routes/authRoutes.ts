import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { loginSchema } from "../logic/validation";
import { verifyPassword } from "../logic/passwordHash";
import { generateSessionId, isExpired, newExpiresAt, SESSION_DURATION_MS, withSlidingExtension } from "../logic/session";
import { UserStore } from "../stores/userStore";
import { SessionStore } from "../stores/sessionStore";
import { loginRateLimiter } from "../middleware/rateLimiter";
import { SESSION_COOKIE_NAME } from "../middleware/authMiddleware";

const GENERIC_LOGIN_ERROR = "メールアドレスまたはパスワードが正しくありません";

export const authRoutes = new Hono();

authRoutes.post("/login", loginRateLimiter, async (c) => {
  const parseResult = loginSchema.safeParse(await c.req.json().catch(() => null));
  if (!parseResult.success) {
    return c.json({ error: GENERIC_LOGIN_ERROR }, 401);
  }
  const { email, password } = parseResult.data;

  const userStore = new UserStore();
  const user = await userStore.findByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: GENERIC_LOGIN_ERROR }, 401);
  }

  const now = Date.now();
  const session = {
    sessionId: generateSessionId(),
    userId: user.userId,
    createdAt: now,
    expiresAt: newExpiresAt(now),
  };
  await new SessionStore().create(session);

  setCookie(c, SESSION_COOKIE_NAME, session.sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return c.json({ userId: session.userId, expiresAt: session.expiresAt });
});

authRoutes.post("/logout", async (c) => {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (sessionId) {
    await new SessionStore().delete(sessionId);
  }
  deleteCookie(c, SESSION_COOKIE_NAME);
  return c.body(null, 200);
});

authRoutes.get("/session", async (c) => {
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

  return c.json({ userId: extended.userId, expiresAt: extended.expiresAt });
});
