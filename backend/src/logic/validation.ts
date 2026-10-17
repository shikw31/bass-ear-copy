import { z } from "zod";

// Input validation (see business-rules.md, SECURITY-05). The exact song duration is unknown
// server-side (Unit 1 owns that), so loop bounds only get a coarse sanity cap here.
export const MAX_MEMO_LENGTH = 2000;
export const MAX_LOOP_SECONDS = 24 * 60 * 60; // 24h coarse cap

export const songKeySchema = z
  .string()
  .regex(/^(local:[0-9a-f]{64}|yt:[A-Za-z0-9_-]{11})$/, "songKeyの形式が無効です");

export const loopPointsSchema = z
  .object({
    a: z.number().min(0).max(MAX_LOOP_SECONDS),
    b: z.number().min(0).max(MAX_LOOP_SECONDS),
    enabled: z.boolean(),
  })
  .refine((points) => points.a < points.b, { message: "A点はB点より前である必要があります" })
  .nullable();

export const memoSchema = z
  .object({
    text: z.string().max(MAX_MEMO_LENGTH),
    updatedAt: z.number(),
  })
  .nullable();

export const songDataPutSchema = z.object({
  songKey: songKeySchema,
  loopPoints: loopPointsSchema,
  memo: memoSchema,
  updatedAt: z.number(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
