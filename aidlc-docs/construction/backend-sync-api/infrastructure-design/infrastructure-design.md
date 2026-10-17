# Infrastructure Design: Backend Sync API

## ホスティング
- **サービス**: Vercel Serverless Functions（Node.jsランタイム）
- **プロジェクト**: モノレポの`backend/`を、Unit 1（Frontend）とは別のVercelプロジェクトとしてデプロイする（Units Generationの決定: 2つの独立したUnitとして個別デプロイ可能にする方針に対応）
- **デプロイ方式**: Gitリポジトリ（`backend/`サブディレクトリ）と連携し、pushごとに自動ビルド・デプロイ

## データストア
- **サービス**: Upstash Redis（マネージド、サーバーレス向け）
- Vercel連携（Vercel Marketplace経由のUpstash統合）により環境変数（`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`）を自動設定できる

## 環境変数（シークレット、Vercelプロジェクト設定で管理。コードにハードコードしない）
| 変数名 | 用途 |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis接続先 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis認証トークン |
| `FRONTEND_ORIGIN` | CORS許可オリジン（Unit 1のVercel URL） |

## アカウントの事前プロビジョニング
- 公開の登録エンドポイントは提供しない（Functional Design Q1）
- 開発者のローカル環境から一度だけ実行するセットアップスクリプト（`backend/scripts/create-account.ts`）で、Upstash Redisに直接ユーザーレコード（email + bcryptjsハッシュ）を書き込む。本番の環境変数にパスワードを置かない

## HTTPレスポンスヘッダー
このUnitはJSONのみを返すAPIであり、HTMLを配信しない。SECURITY-04（CSP, X-Frame-Options, Referrer-Policy）はHTML配信エンドポイント向けのルールのため、**N/A（該当なし）**と判断する。一方、以下は適用する:

| Header | 値 | 理由 |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Vercelは自動的にHTTPSを提供するが、明示的に強制する |
| `X-Content-Type-Options` | `nosniff` | JSON APIでもMIMEスニッフィング対策として安価に設定できる |

## CORS
- Honoの`cors()`ミドルウェアで、`FRONTEND_ORIGIN`環境変数の値のみを許可オリジンとする（SECURITY-08、ワイルドカード不可）
- 認証情報（Cookie）を含むクロスオリジンリクエストを許可するため、`credentials: true`相当の設定を行う

## モニタリング
- 専用の監視基盤は導入しない（Resiliency Baseline拡張無効化済み）。Vercelの標準ログ・GlobalErrorHandlerのログ出力で十分とする
