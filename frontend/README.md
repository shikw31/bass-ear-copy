# 耳コピ補助アプリ — Frontend Web App

ベース練習の耳コピを補助するWebアプリのフロントエンド（Unit 1）。React + TypeScript + Vite。

## セットアップ

```bash
npm install
cp .env.example .env.local   # VITE_BACKEND_API_URL をBackend Sync APIのURLに合わせて編集
```

## 開発サーバー起動

```bash
npm run dev
```

## テスト実行

```bash
npm test          # 一回実行
npm run test:watch
```

## ビルド

```bash
npm run build
```

## 主な機能（対応ストーリー）
- ローカル音声ファイル（mp3/wav/m4a）読み込み、低音域強調EQ、音程保持スロー再生、サンプル精度に近いA-Bループ、音名/周波数表示、波形/スペクトログラム表示
- YouTube埋め込み再生（再生速度変更、簡易A-Bループ）
- 曲ごとのループ区間・メモの保存（オフラインファースト、ログイン時はクラウド同期）

## 設計ドキュメント
`aidlc-docs/construction/frontend-web-app/` 配下（functional-design, nfr-requirements, nfr-design, infrastructure-design, code）を参照。
