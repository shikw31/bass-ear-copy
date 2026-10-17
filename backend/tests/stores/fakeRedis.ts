import type { Redis } from "@upstash/redis";

// Minimal in-memory fake covering only the Redis subset the stores use (get/set/del),
// so repository-layer tests don't need real Upstash credentials.
export function createFakeRedis(): Redis {
  const data = new Map<string, unknown>();
  return {
    get: async <T>(key: string) => (data.has(key) ? (data.get(key) as T) : null),
    set: async (key: string, value: unknown) => {
      data.set(key, value);
      return "OK";
    },
    del: async (key: string) => {
      const existed = data.delete(key);
      return existed ? 1 : 0;
    },
  } as unknown as Redis;
}
