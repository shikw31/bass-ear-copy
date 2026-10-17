import type { Session } from "../domain/types";

// Session lifecycle (see business-logic-model.md sections 1-2, business-rules.md: 30-day
// sliding expiration).
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function newExpiresAt(nowMs: number): number {
  return nowMs + SESSION_DURATION_MS;
}

export function isExpired(session: Session, nowMs: number): boolean {
  return nowMs >= session.expiresAt;
}

// Sliding extension: a still-valid session's expiry is pushed forward on every successful
// access. An already-expired session is never revived by this function (caller must still
// reject access — see authMiddleware.ts).
export function withSlidingExtension(session: Session, nowMs: number): Session {
  return { ...session, expiresAt: newExpiresAt(nowMs) };
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
