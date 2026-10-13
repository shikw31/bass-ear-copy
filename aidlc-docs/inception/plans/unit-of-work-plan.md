# Unit of Work Plan: 耳コピ補助アプリ

## Context
- Application Designの結果: フロントエンド12コンポーネント（音声処理/UI）、バックエンド4コンポーネント（単一サービス：認証＋データ同期）
- この境界（フロントエンド/バックエンド）がそのままUnit境界の第一候補

## Questions

### Q1: ユニット境界（デプロイ単位）
フロントエンドとバックエンドを、開発・デプロイ上どう扱いますか？

A) 2つの独立したUnit（Frontend Web App / Backend Sync API）として分離する。それぞれ個別にデプロイ・テストできる

B) 1つのUnit（フルスタック）としてまとめる（例: フロントエンドとAPIルートを同一アプリ内に持つフレームワークを使い、単一デプロイ単位にする）

C) Other (please describe after [Answer]: tag below)

[Answer]: A（2つのUnitに分離）

### Q2: コード構成（Greenfield・複数Unit想定時）
Q1でA（2 Unit）を選んだ場合、リポジトリ構成はどうしますか？（Bを選んだ場合はN/Aとして進めます）

A) 単一リポジトリ内に `frontend/` と `backend/` のサブディレクトリを分ける（モノレポ、個人開発に扱いやすい）

B) フロントエンドとバックエンドを別々のリポジトリにする

C) Other (please describe after [Answer]: tag below)

[Answer]: A（モノレポ、frontend/とbackend/のサブディレクトリ）

## Team Alignment（評価のみ、質問不要）
- **適用性**: N/A — 開発者は本人のみ（単独個人プロジェクト）。チーム分割・オーナーシップ境界の調整は不要

## Business Domain（評価のみ、質問不要）
- Application Designのコンポーネント境界が、そのままドメイン境界と一致している：
  - **Playback/Audio Domain**（音源入力・再生・EQ・タイムストレッチ・ピッチ検出・波形表示・ループ） → フロントエンド中心
  - **Account/Sync Domain**（認証・曲データの永続化・同期） → バックエンド中心

## Dependencies（評価のみ、質問不要）
- フロントエンド（SyncClient/AuthClient）→ バックエンド（AppBackendAPI）へHTTP経由で依存。Application Designで既に定義済みのため、追加質問は不要

## Execution Checklist

- [x] Step A: Q1・Q2の回答を分析し、矛盾・曖昧さがないか確認する（両回答とも推奨案、一貫性あり）
- [x] Step B: Unit定義を作成する（unit-of-work.md）。Greenfieldのためコード構成方針も記載
- [x] Step C: Unit間の依存関係マトリクスを作成する（unit-of-work-dependency.md）
- [x] Step D: 全ストーリー（Story 1〜8）をUnitにマッピングする（unit-of-work-story-map.md）
- [x] Step E: Unit境界・依存関係の妥当性を検証する（循環依存なし、全ストーリー割り当て済み）
