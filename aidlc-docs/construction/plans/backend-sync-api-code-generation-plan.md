# Code Generation Plan: Backend Sync API

## Unit Context
- **Unit**: Backend Sync API（`backend/`、ワークスペースルート: `/Users/shikw31/Documents/bass-ear-copy`）
- **対象ストーリー**: Story 7（曲データ保存）, Story 8（ログイン・クラウド同期）のバックエンド側
- **依存**: Upstash Redis（外部マネージドサービス、環境変数で接続）。Unit 1（Frontend）からHTTPS+Cookieで呼ばれる
- **参照設計**: components.md等（Application Design）/ business-logic-model.md, business-rules.md, domain-entities.md（Functional Design）/ nfr-design-patterns.md, logical-components.md（NFR Design）/ infrastructure-design.md, deployment-architecture.md（Infrastructure Design）
- **技術スタック**: TypeScript + Hono, Upstash Redis, bcryptjs, zod, Vitest + fast-check（PBT-09）

## コード配置方針
- `backend/src/`, `backend/tests/`, `backend/api/`（Vercelのファイルベースルーティング用エントリ）, `backend/scripts/`（事前プロビジョニング用）
- ドキュメントは`aidlc-docs/construction/backend-sync-api/code/`にMarkdownで作成する

## Steps

- [x] **Step 1: Project Structure Setup**
  - `backend/package.json`, `tsconfig.json`, `.env.example`, `.gitignore`
  - 依存: hono, @upstash/redis, @upstash/ratelimit, bcryptjs, zod, typescript, vitest, fast-check
  - Story: 基盤

- [x] **Step 2: Business Logic Generation**
  - `src/domain/types.ts`（User, Session, SongRecord）
  - `src/logic/passwordHash.ts`（bcryptjsラッパー: hash/verify）
  - `src/logic/session.ts`（有効期限計算、スライディング延長ロジック）
  - `src/logic/songConflict.ts`（LWW判定: `shouldAcceptWrite(existing, incoming)`）
  - `src/logic/validation.ts`（zodスキーマ: songKey形式, メモ長, ループ区間, ログイン資格情報）
  - Story: 7, 8

- [x] **Step 3: Business Logic Unit Testing**
  - `tests/logic/passwordHash.test.ts`, `tests/logic/session.test.ts`, `tests/logic/songConflict.test.ts`, `tests/logic/validation.test.ts`
  - fast-checkによるPBTテスト（business-logic-model.mdのProperty識別表に対応）

- [x] **Step 4: Business Logic Summary**
  - `aidlc-docs/construction/backend-sync-api/code/business-logic-summary.md`

- [x] **Step 5: Repository Layer Generation**
  - `src/stores/redisClient.ts`（Upstash Redisクライアント生成）
  - `src/stores/userStore.ts`, `src/stores/sessionStore.ts`, `src/stores/songRecordStore.ts`

- [x] **Step 6: Repository Layer Unit Testing**
  - `tests/stores/*.test.ts`（Upstash Redisクライアントをモック）

- [x] **Step 7: Repository Layer Summary**
  - `aidlc-docs/construction/backend-sync-api/code/repository-layer-summary.md`

- [x] **Step 8: API Layer Generation**
  - `src/middleware/authMiddleware.ts`, `src/middleware/rateLimiter.ts`
  - `src/routes/authRoutes.ts`（`/auth/login`, `/auth/logout`, `/auth/session`）
  - `src/routes/songsRoutes.ts`（`GET/PUT /songs/:songKey`）
  - `src/app.ts`（Honoアプリ定義、CORS、グローバルエラーハンドラ、ルーティング統合）
  - `api/[[...route]].ts`（Vercel Serverless Function エントリ、`hono/vercel`アダプタ経由で`src/app.ts`をマウント）
  - Story: 7, 8

- [x] **Step 9: API Layer Unit Testing**
  - `tests/routes/authRoutes.test.ts`, `tests/routes/songsRoutes.test.ts`（Honoの`app.request()`によるルートテスト、ストアをモック）

- [x] **Step 10: API Layer Summary**
  - `aidlc-docs/construction/backend-sync-api/code/api-layer-summary.md`

- [x] **Step 11: Frontend Components — N/A**
  - このUnitにUIは存在しない

- [x] **Step 12: Database Migration Scripts — N/A**
  - Upstash Redisはスキーマレスのためマイグレーション不要

- [x] **Step 13: Documentation Generation**
  - `backend/README.md`（セットアップ、環境変数、事前プロビジョニング手順、テスト実行方法）

- [x] **Step 14: Deployment Artifacts Generation**
  - `backend/vercel.json`（rewrites for `/auth/*`・`/songs/*` → catch-all function、HSTS/X-Content-Type-Optionsヘッダー設定）
  - `backend/scripts/create-account.ts`（事前プロビジョニングスクリプト）
