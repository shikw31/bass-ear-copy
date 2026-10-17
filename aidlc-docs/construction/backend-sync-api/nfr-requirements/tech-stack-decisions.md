# Tech Stack Decisions: Backend Sync API

| 項目 | 決定 | 根拠 |
|---|---|---|
| 言語 | TypeScript | フロントエンド（Unit 1）と統一し、型・知識を再利用（ユーザー選択） |
| フレームワーク | Hono | 軽量、Vercelのサーバーレス関数としてそのまま動作。フロントエンドと同じホスティング先に統一できる（ユーザー選択） |
| データストア | Upstash Redis | User/Session/SongRecordは全て単純なキー検索で十分なため、リレーショナルDBのスキーマ管理・マイグレーションが不要（ユーザー選択） |
| パスワードハッシュ | bcryptjs | ピュアJS実装でサーバーレス環境でも確実に動作するアダプティブアルゴリズム（SECURITY-12） |
| 入力検証 | zod | スキーマベースのバリデーション、TypeScriptとの親和性が高い（SECURITY-05） |
| セッション | Cookieベース（sessionId、Secure/HttpOnly/SameSite=Lax） | SECURITY-12準拠。Upstash Redisにセッションレコードを保存し、sessionIdのみCookieで配布 |
| CORS | Hono標準のcorsミドルウェア、フロントエンドオリジンのみ許可 | SECURITY-08 |
| レート制限 | ログインエンドポイントにIPベースの簡易カウンタ（Upstash Redis利用） | SECURITY-11, SECURITY-12 |
| テストランナー | Vitest | Unit 1と統一 |
| Property-Based Testingフレームワーク（PBT-09） | fast-check | Unit 1と統一。Vitestと統合 |
| 依存管理 | npm + package-lock.json | バージョン固定（SECURITY-10） |

## PBT-09 Compliance
- フレームワーク: fast-check（Unit 1と同一）
- 対象: Functional Designで識別したProperty（パスワード検証の往復性、セッション検証の不変条件/冪等性、LWW強制の不変条件/冪等性、入力検証の不変条件）
