# 耳コピ補助アプリ — Backend Sync API

認証とクラウド同期（曲ごとのループ区間・メモ）を担うバックエンド（Unit 2）。TypeScript + Hono、Upstash Redis、Vercel Serverless Functionsで動作する。

## セットアップ

```bash
npm install
cp .env.example .env.local   # UPSTASH_REDIS_REST_URL/TOKEN, FRONTEND_ORIGIN を編集
```

ローカル実行には環境変数を実際のプロセス環境に読み込む必要がある（例: `set -a && source .env.local && set +a`）。

## テスト実行

```bash
npm test
```

## 型チェック

```bash
npm run build
```

## アカウントの作成（事前プロビジョニング、公開登録なし）

```bash
npm run create-account -- you@example.com "a-strong-password"
```

実行には`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`が環境変数に設定されている必要がある。

## API

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/auth/login` | ログイン、セッションCookieを設定 |
| POST | `/auth/logout` | ログアウト、セッションCookieを削除 |
| GET | `/auth/session` | 現在のログイン状態を確認（スライディング延長） |
| GET | `/songs/:songKey` | 曲データの取得（認証必須） |
| PUT | `/songs/:songKey` | 曲データの保存（認証必須、サーバー側Last-Write-Wins） |

## 設計ドキュメント
`aidlc-docs/construction/backend-sync-api/` 配下（functional-design, nfr-requirements, nfr-design, infrastructure-design, code）を参照。
