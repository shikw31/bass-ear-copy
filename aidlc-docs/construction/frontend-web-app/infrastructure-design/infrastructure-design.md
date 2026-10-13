# Infrastructure Design: Frontend Web App

## ホスティング
- **サービス**: Vercel
- **デプロイ方式**: Gitリポジトリ（モノレポの`frontend/`サブディレクトリ）と連携し、pushごとに自動ビルド・デプロイ
- **CDN**: Vercelの標準CDN配信により、NFR性能要件（初期ロード3秒以内）を満たす

## HTTPセキュリティヘッダー（SECURITY-04対応）
`vercel.json`で以下のヘッダーを全レスポンスに設定する:

| Header | 値 |
|---|---|
| Content-Security-Policy | `default-src 'self'; connect-src 'self' https://api.<backend-domain> https://www.youtube.com; frame-src https://www.youtube.com; img-src 'self' data:` |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `SAMEORIGIN` |
| Referrer-Policy | `strict-origin-when-cross-origin` |

**補足**: CSPの`connect-src`にBackend Sync APIのドメイン（Unit 2 Infrastructure Designで確定）とYouTube IFrame Player APIの通信先を許可する必要がある。`frame-src`はYouTube埋め込み（FR2.2）のために必要。

## ドメイン
- Vercelが提供するデフォルトサブドメイン（例: `bass-ear-copy.vercel.app`）を使用。カスタムドメインは導入しない

## モニタリング
- 専用の監視基盤は導入しない（Resiliency Baseline拡張無効化済み）。GlobalErrorBoundary（NFR Design済み）とブラウザコンソールログで十分とする

## CORSに関する前提
- このフロントエンドのオリジン（`https://bass-ear-copy.vercel.app`等、確定後にURLを記録する）を、Backend Sync APIのCORS許可リストに登録する必要がある（Unit 2 Infrastructure Designで実施）
