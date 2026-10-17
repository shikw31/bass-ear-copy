import { handle } from "hono/vercel";
import { app } from "../src/app";

// Vercel Serverless Function entry (see infrastructure-design.md). The [[...route]] filename
// makes this a catch-all under /api/*; Vercel's rewrites (vercel.json) map the public paths
// (/auth/*, /songs/*) onto it.
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
