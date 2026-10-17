# API Layer Summary: Backend Sync API

## 生成されたファイル
- `src/middleware/authMiddleware.ts` — deny-by-defaultのセッション検証、スライディング延長（SECURITY-08, SECURITY-12）
- `src/middleware/rateLimiter.ts` — `@upstash/ratelimit`によるログインエンドポイントのレート制限
- `src/routes/authRoutes.ts` — `POST /login`, `POST /logout`, `GET /session`
- `src/routes/songsRoutes.ts` — `GET /:songKey`, `PUT /:songKey`（サーバー側LWW、userId除去したレスポンス）
- `src/app.ts` — Honoアプリ本体（CORS, ルーティング統合, グローバルエラーハンドラ）
- `api/[[...route]].ts` — Vercel Serverless Function エントリ（`hono/vercel`）

## テスト（`backend/tests/routes/`）
Honoの`app.request()`を使い、ストア層をモックしてルートの振る舞いを検証:
- ログイン成功時のCookie設定、失敗時の汎用401（ユーザー列挙防止: 不明なメールアドレスと誤ったパスワードで同じエラーメッセージ）
- ログアウトでのセッション削除
- `/songs/*`への未認証アクセスの401拒否
- 曲データの404/200/409（サーバー側LWW、`userId`がレスポンスに含まれないこと）
- `userId`による曲データのスコープ分離

## 検証結果
- `npx tsc --noEmit` — 型エラーなし
- `npx vitest run` — 9テストファイル / 31テスト全て成功
- `npm audit` — 0件の脆弱性

## 実装上の注記
- Vitestの自動モック（`vi.mock`）でクラスをモックする際、`mockImplementation`には`function`（アロー関数不可）を渡す必要がある。`new`で呼び出されるため、アロー関数は"is not a constructor"エラーになる
