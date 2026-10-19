import { serve } from "@hono/node-server";
import { app } from "./app";

// Local-only dev server (see build-and-test/integration-test-instructions.md). Not used in
// production — Vercel serves `app` via api/[[...route]].ts instead.
const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Backend Sync API (dev) listening on http://localhost:${info.port}`);
});
