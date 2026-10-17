import { Redis } from "@upstash/redis";

// Shared Upstash Redis client (HTTP-based — see nfr-design-patterns.md: works cleanly in
// serverless functions without connection-pooling concerns). Reads config from env at call time
// (not module load time) so tests can run without real credentials.
let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    client = Redis.fromEnv();
  }
  return client;
}
