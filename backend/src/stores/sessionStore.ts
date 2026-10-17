import type { Redis } from "@upstash/redis";
import type { Session } from "../domain/types";
import { getRedisClient } from "./redisClient";

function sessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

function ttlSecondsFrom(expiresAt: number, nowMs: number): number {
  return Math.max(1, Math.ceil((expiresAt - nowMs) / 1000));
}

// SessionStore (see logical-components.md). Uses Redis TTL (EX) so expired sessions are
// automatically reclaimed, in addition to the explicit expiresAt check in session.ts.
export class SessionStore {
  constructor(private readonly redis: Redis = getRedisClient()) {}

  async create(session: Session): Promise<void> {
    await this.redis.set(sessionKey(session.sessionId), session, {
      ex: ttlSecondsFrom(session.expiresAt, Date.now()),
    });
  }

  async find(sessionId: string): Promise<Session | null> {
    return (await this.redis.get<Session>(sessionKey(sessionId))) ?? null;
  }

  async extend(session: Session, nowMs: number): Promise<void> {
    await this.redis.set(sessionKey(session.sessionId), session, {
      ex: ttlSecondsFrom(session.expiresAt, nowMs),
    });
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(sessionKey(sessionId));
  }
}
