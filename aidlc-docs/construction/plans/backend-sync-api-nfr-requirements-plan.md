# NFR Requirements Plan: Backend Sync API

## Context
- Functional Designのロジック（認証、セッション検証、曲データのサーバー側LWW）を踏まえ、技術スタックを決定する
- データモデルは単純（User1件、Session、SongRecordはuserId+songKeyでキー化）。複雑なリレーショナルクエリは不要

## Questions

### Q1: バックエンドの言語・フレームワーク
A) Node.js + TypeScript + Hono（推奨） — フロントエンドと同じ言語でコード・知識を再利用できる。Honoは軽量でVercelのサーバーレス関数としてそのまま動かせ、フロントエンドと同じホスティング先に統一できる

B) Node.js + TypeScript + Express — 最も広く使われており、情報量が多い。サーバーレス関数としても動くが設定がHonoよりやや手間

C) 別言語（Python/Go等） — Other欄に記載

D) Other (please describe after [Answer]: tag below)

[Answer]: A（Node.js + TypeScript + Hono）

### Q2: データストア
A) Upstash Redis（推奨） — サーバーレス向けのマネージドKey-Valueストア。User/Session/SongRecordはいずれも単純なキー検索で十分なため、リレーショナルDBのスキーマ管理・マイグレーションが不要。無料枠あり

B) マネージドPostgres（例: Neon, Supabase, Vercel Postgres） — より本格的なリレーショナルDB。将来複雑なクエリが必要になった場合に拡張しやすいが、今回の単純なデータモデルには少しオーバースペック

C) Other (please describe after [Answer]: tag below)

[Answer]: A（Upstash Redis）

## 事前に決定する項目（レビューしてご確認ください、質問は設けません）

### パフォーマンス要件
- 個人用ツールのため、高いスループット要件はない。API応答は目安1秒以内（Cold Start込み）

### 可用性・スケーラビリティ
- 個人用ツールのため、可用性SLAは設定しない（Resiliency Baseline拡張は無効化済み）

### セキュリティ要件（Security Baseline拡張、全ルール適用対象）
- パスワードハッシュ: `bcryptjs`（ピュアJS実装、ネイティブ依存なしでサーバーレス環境でも確実に動作。SECURITY-12準拠のアダプティブアルゴリズム）
- セッションCookie: `Secure`, `HttpOnly`, `SameSite=Lax`属性を設定（SECURITY-12）
- CORS: フロントエンドのオリジン（Unit 1のVercel URL）のみを許可（SECURITY-08）
- 入力検証: `zod`等のスキーマ検証ライブラリを使用（SECURITY-05）
- レート制限: ログインエンドポイントにIP単位の簡易レート制限を導入（SECURITY-11）
- 依存管理: npm + package-lock.jsonでバージョン固定、`npm audit`で脆弱性ゼロを確認（SECURITY-10、Unit 1と同様の運用）

### テスト・PBTフレームワーク選定（PBT-09）
- テストランナー: Vitest（Unit 1と統一）
- Property-Based Testingフレームワーク: fast-check（Unit 1と統一）

## Execution Checklist

- [x] Step A: Q1・Q2の回答を分析し、矛盾・曖昧さがないか確認する（両回答とも推奨案、矛盾なし。Hono+Upstash Redisはどちらもサーバーレスフレンドリーで整合する組み合わせ）
- [x] Step B: NFR要件を文書化する（nfr-requirements.md）
- [x] Step C: 技術スタック決定を文書化する（tech-stack-decisions.md）
