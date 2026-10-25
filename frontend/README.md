# 耳コピDI — Frontend Web App

ベース練習の耳コピを補助するWebアプリ。React + TypeScript + Vite。ログイン不要、ブラウザのローカルストレージのみで動作する単体のWebアプリ（バックエンド不要）。

見た目はスタジオ機材（ラックユニット/DIボックス）をモチーフにしたダークテーマ。各機能はパネルセクション（TRANSPORT / TONE / LOOP / TUNER・SCOPE / NOTES）に分かれ、数値表示はドットマトリクス風のLED表示（`src/styles.css`）。

## セットアップ

```bash
npm install
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

## 主な機能
- ローカル音声ファイル（mp3/wav/m4a）読み込み、低音域強調EQ、音程保持スロー再生、サンプル精度に近いA-Bループ、音名/周波数表示、波形/スペクトログラム表示
- YouTube埋め込み再生（再生速度変更、簡易A-Bループ）。EQ・音程表示・波形表示は技術的制約（埋め込みプレーヤーから生音声を取得できない）により対象外
- **マイク入力モード**: YouTube等を別端末・スピーカーで再生しつつ、マイク経由でこのアプリに音を入力し、低音域EQ・音程表示・波形表示を使える（再生速度変更・ループは対象外。ヘッドホン推奨、スピーカーだとハウリングの原因になる）
- 曲ごとのループ区間・メモの保存（端末のブラウザにローカル保存。ログイン・端末間同期はなし）

## 設計ドキュメント
`aidlc-docs/construction/frontend-web-app/` 配下（functional-design, nfr-requirements, nfr-design, infrastructure-design, code）を参照。
