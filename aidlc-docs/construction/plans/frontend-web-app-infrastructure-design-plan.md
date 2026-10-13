# Infrastructure Design Plan: Frontend Web App

## Context
- Frontend Web Appは React+TypeScript+Viteでビルドされる静的SPA（HTML/JS/CSSバンドル）
- サーバーサイドの計算リソースは不要（音声処理は全てブラウザ内で実行）
- SECURITY-04（HTTPセキュリティヘッダー）への対応と、NFR性能要件（初期ロード3秒以内）を満たすホスティングが必要

## Questions

### Q1: ホスティング先
A) Vercel（推奨） — 無料枠あり、Gitリポジトリからの自動デプロイ、`vercel.json`でカスタムHTTPヘッダー設定が可能、CDN配信

B) Netlify — Vercelと同等の特徴（無料枠、自動デプロイ、`_headers`ファイルでヘッダー設定可能）

C) AWS（S3 + CloudFront） — より本格的なAWS構成。ヘッダー設定にはCloudFront FunctionsやLambda@Edgeが必要で、設定の手間が増える

D) Other (please describe after [Answer]: tag below)

[Answer]: A（Vercel）

## 事前に決定する項目（レビューしてご確認ください、質問は設けません）
- **カスタムドメイン**: 不要。ホスティングサービスが提供するデフォルトのサブドメインを使用する（個人用途のため、後から追加可能）
- **モニタリング**: 専用の監視基盤は導入しない。ブラウザコンソールへのエラー出力とGlobalErrorBoundary（NFR Design済み）で十分とする（Resiliency Baseline拡張は無効化済み）
- **CORS**: フロントエンドのオリジン（ホスティング確定後のURL）をBackend Sync APIのCORS許可リストに登録する（Unit 2のInfrastructure Designで設定）

## Execution Checklist

- [x] Step A: Q1の回答を分析する（曖昧さなし）
- [x] Step B: infrastructure-design.mdを作成する
- [x] Step C: deployment-architecture.mdを作成する
