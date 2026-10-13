# NFR Requirements Plan: Frontend Web App

## Context
- Functional Designの音声処理ロジック（EQ, タイムストレッチ, ピッチ検出, 波形表示）とオフラインファースト保存ロジックを踏まえ、技術スタックとNFRを決定する

## Questions

### Q1: フロントエンドフレームワーク
A) React（TypeScript/JavaScript）— 最も一般的、エコシステムが大きい

B) Svelte/SvelteKit — 軽量、学習コストが低め、個人プロジェクトに向く

C) Vue — Reactに近い学習コストで、Composition APIがシンプル

D) フレームワークなし（Vanilla JS/TypeScript + Vite） — 依存を最小にしたい場合

E) Other (please describe after [Answer]: tag below)

[Answer]: A（React。情報量・AI活用のサンプルコードの多さを重視）

**解説で提示した補足**: Reactは情報量/AIサンプルコードが最多、Vueは学習コストが低く日本語情報も豊富、Svelteはコード量最少だがエコシステムは小さめ、Vanillaは依存最小だが機能追加に伴い手書きUI更新管理が増える。

### Q2: TypeScriptを使うか
音声処理ロジック（EQ係数、タイムストレッチのrate、ピッチ検出結果など）は数値・型の取り違えによるバグが起きやすい領域です。

A) TypeScriptを使う（推奨） — 型安全性により音声処理ロジックのバグを減らせる。初期セットアップの手間は増える

B) JavaScript（型なし）を使う — セットアップが速く、すぐに書き始められる

C) Other (please describe after [Answer]: tag below)

[Answer]: A（TypeScriptを使う。Viteテンプレートでセットアップコストは低い）

### Q3: ピッチ検出の実装方法
A) 既存の軽量ライブラリを使う（推奨） — 例: pitchy（McLeod Pitch Method実装）。実装の手間を減らし、精度が検証済みのアルゴリズムを使える

B) 自前でアルゴリズムを実装する（自己相関法等） — 依存を増やさないが、実装・デバッグに時間がかかる

C) Other (please describe after [Answer]: tag below)

[Answer]: A（既存ライブラリ pitchy を使う。オクターブエラー対策済みの実装を活用し、時間制約に対応）

## 事前に決定する項目（レビューしてご確認ください、質問は設けません）

### パフォーマンス要件
- EQ/タイムストレッチの処理遅延: 知覚できないレベル（目安50ms以内）
- ピッチ検出の更新頻度: 10〜20Hz程度（音声フレームごとではなく、UI表示に十分な頻度に間引く）
- 波形/スペクトログラム描画: 30fps程度で十分（ゲームのような60fps要求はない）

### 可用性・スケーラビリティ要件
- 個人用ツールのため、可用性SLA・スケーラビリティ要件は設定しない（Resiliency Baseline拡張は無効化済み）

### セキュリティ要件（Security Baseline拡張、SECURITY-12準拠）
- 認証トークンはフロントエンドのJavaScriptから直接アクセスできる場所（localStorage等）に保存しない。バックエンドが発行するhttpOnly・Secure・SameSite属性付きのセッションCookieに一任する（XSSによるトークン窃取を防ぐ）
- AuthClientはCookieの内容を直接操作せず、ログイン状態の有無のみをバックエンドに問い合わせる形にする

### ローカル永続化技術
- loopPoints・memoなどのデータサイズは小さいため、localStorage（JSON文字列化）で十分。IndexedDBのような複雑なAPIは不要と判断する

### テスト・PBTフレームワーク選定（PBT-09）
- テストランナー: Vitest（Viteベースのビルドツールと組み合わせる場合に自然な選択。Jest同等の機能を持つ）
- Property-Based Testingフレームワーク: fast-check（Vitest/Jestと統合可能、PBT-09の推奨表に準拠）

## Execution Checklist

- [x] Step A: Q1〜Q3の回答を分析し、矛盾・曖昧さがないか確認する（矛盾なし。React+TypeScript+pitchyは一貫した組み合わせ）
- [x] Step B: NFR要件を文書化する（nfr-requirements.md）
- [x] Step C: 技術スタック決定を文書化する（tech-stack-decisions.md）
