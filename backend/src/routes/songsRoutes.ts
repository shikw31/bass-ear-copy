import { Hono } from "hono";
import type { AuthVariables } from "../middleware/authMiddleware";
import type { SongRecord } from "../domain/types";
import { songDataPutSchema, songKeySchema } from "../logic/validation";
import { shouldAcceptWrite } from "../logic/songConflict";
import { SongRecordStore } from "../stores/songRecordStore";

// songsRoutes (see business-logic-model.md sections 4-5). Mounted behind authMiddleware in
// app.ts, so `c.get("userId")` is always set here.
export const songsRoutes = new Hono<{ Variables: AuthVariables }>();

function toWorkspaceState(record: SongRecord) {
  // Never leak userId to the client — the response shape matches Unit 1's SongWorkspaceState.
  const { songKey, loopPoints, memo, updatedAt } = record;
  return { songKey, loopPoints, memo, updatedAt };
}

songsRoutes.get("/:songKey", async (c) => {
  const songKeyParse = songKeySchema.safeParse(c.req.param("songKey"));
  if (!songKeyParse.success) {
    return c.json({ error: "songKeyの形式が無効です" }, 400);
  }

  const userId = c.get("userId");
  const record = await new SongRecordStore().find(userId, songKeyParse.data);
  if (!record) {
    return c.json({ error: "見つかりません" }, 404);
  }
  return c.json(toWorkspaceState(record));
});

songsRoutes.put("/:songKey", async (c) => {
  const songKeyParse = songKeySchema.safeParse(c.req.param("songKey"));
  const bodyParse = songDataPutSchema.safeParse(await c.req.json().catch(() => null));
  if (!songKeyParse.success || !bodyParse.success || bodyParse.data.songKey !== songKeyParse.data) {
    return c.json({ error: "リクエストが無効です" }, 400);
  }

  const userId = c.get("userId");
  const store = new SongRecordStore();
  const incoming: SongRecord = { userId, ...bodyParse.data };
  const existing = await store.find(userId, songKeyParse.data);

  if (!shouldAcceptWrite(existing, incoming)) {
    // Server-enforced Last-Write-Wins (business-logic-model.md section 5) — the caller
    // (Unit 1's syncOrchestrationService) is expected to adopt `existing` and stop retrying.
    return c.json(toWorkspaceState(existing!), 409);
  }

  await store.save(incoming);
  return c.json(toWorkspaceState(incoming));
});
