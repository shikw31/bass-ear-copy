# Build Instructions

## Prerequisites
- **Node.js**: v20以上（推奨: 現行LTS）
- **npm**: Node.js同梱のもの
- **外部サービス（Unit 2のみ）**: Upstash Redisアカウント（デプロイ・実機テスト時に必要。ローカルでのビルド・単体テストには不要）

## Unit 1: Frontend Web App

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# VITE_BACKEND_API_URL を Backend Sync APIのURL（ローカル開発時は http://localhost:8787）に設定
```

### 3. Build
```bash
npm run build
```

### 4. Verify Build Success
- **Expected Output**: `tsc --noEmit`がエラーなく完了し、続けて`vite build`が`dist/`にファイルを生成する
- **Build Artifacts**: `frontend/dist/`（`index.html`, `assets/*.js`）
- **検証済み**: 2026-10-13時点で型チェック・ビルドともに成功（`aidlc-docs/construction/frontend-web-app/code/business-logic-summary.md`参照）

## Unit 2: Backend Sync API

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, FRONTEND_ORIGIN を設定
```

### 3. Build（型チェックのみ。実際のバンドルはVercelのデプロイ時に行われる）
```bash
npm run build
```

### 4. Verify Build Success
- **Expected Output**: `tsc --noEmit`がエラーなく完了する
- **検証済み**: 2026-10-17時点で型チェック成功（`aidlc-docs/construction/backend-sync-api/code/api-layer-summary.md`参照）

## Troubleshooting

### Build Fails with Dependency Errors
- **Cause**: `package-lock.json`と実際にインストールされたNode.jsバージョンの不整合
- **Solution**: `node -v`で20以上を確認し、`rm -rf node_modules package-lock.json && npm install`でクリーンインストール

### Build Fails with Compilation Errors
- **Cause**: TypeScriptの型エラー
- **Solution**: エラーメッセージのファイル・行番号を確認し、該当する型定義（`src/domain/types.ts`等）との不整合を修正する
