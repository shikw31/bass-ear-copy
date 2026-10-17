import type { Redis } from "@upstash/redis";
import type { User } from "../domain/types";
import { getRedisClient } from "./redisClient";

// UserStore (see logical-components.md). Pre-provisioned, single-record lookup by email
// (Functional Design Q1 — no public registration).
function userKey(email: string): string {
  return `user:${email}`;
}

export class UserStore {
  constructor(private readonly redis: Redis = getRedisClient()) {}

  async findByEmail(email: string): Promise<User | null> {
    return (await this.redis.get<User>(userKey(email))) ?? null;
  }

  async create(user: User): Promise<void> {
    await this.redis.set(userKey(user.email), user);
  }
}
