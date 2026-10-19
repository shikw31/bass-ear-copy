import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthVariables } from "./middleware/authMiddleware";
import { authMiddleware } from "./middleware/authMiddleware";
import { authRoutes } from "./routes/authRoutes";
import { songsRoutes } from "./routes/songsRoutes";

// Top-level Hono app (see services.md: AppBackendAPI). Mounted by api/[[...route]].ts for Vercel,
// and imported directly in tests via Hono's app.request().
export const app = new Hono<{ Variables: AuthVariables }>();

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "",
    credentials: true,
  }),
);

// Health check — useful for confirming the server/function is up before Upstash credentials
// are configured (see build-and-test/integration-test-instructions.md).
app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/auth", authRoutes);
app.use("/songs/*", authMiddleware);
app.route("/songs", songsRoutes);

// GlobalErrorHandler (see nfr-design-patterns.md): never leak internal details (SECURITY-09,
// SECURITY-15).
app.onError((err, c) => {
  console.error("Unhandled error", err);
  return c.json({ error: "サーバーエラーが発生しました" }, 500);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));
