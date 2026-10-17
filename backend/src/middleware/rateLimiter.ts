import { createMiddleware } from "hono/factory";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient } from "../stores/redisClient";

// RateLimiter (see logical-components.md, NFR Design: SECURITY-11/12 brute-force protection).
// Sliding window: 10 attempts per minute per client IP, applied to /auth/login.
let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit {
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "ratelimit:login",
    });
  }
  return limiter;
}

export const loginRateLimiter = createMiddleware(async (c, next) => {
  const ip = c.req.header("x-forwarded-for") ?? "unknown";
  const { success } = await getLimiter().limit(ip);
  if (!success) {
    return c.json({ error: "試行回数が多すぎます。しばらくしてから再度お試しください" }, 429);
  }
  await next();
});
