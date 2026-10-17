import type { Redis } from "@upstash/redis";
import type { SongRecord } from "../domain/types";
import { getRedisClient } from "./redisClient";

function songKeyFor(userId: string, songKey: string): string {
  return `song:${userId}:${songKey}`;
}

// SongRecordStore (implements the SongDataStore role from Application Design's components.md).
export class SongRecordStore {
  constructor(private readonly redis: Redis = getRedisClient()) {}

  async find(userId: string, songKey: string): Promise<SongRecord | null> {
    return (await this.redis.get<SongRecord>(songKeyFor(userId, songKey))) ?? null;
  }

  async save(record: SongRecord): Promise<void> {
    await this.redis.set(songKeyFor(record.userId, record.songKey), record);
  }
}
