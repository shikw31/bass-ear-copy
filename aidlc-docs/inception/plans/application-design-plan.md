# Application Design Plan: 耳コピ補助アプリ

## Context
- 要件: `aidlc-docs/inception/requirements/requirements.md`（FR1〜FR8）
- ストーリー: `aidlc-docs/inception/user-stories/stories.md`（Story 1〜8）
- 構成: フロントエンド（音声処理・UI、ローカルファイル/YouTube両対応）＋バックエンド（認証・クラウド同期）

## Questions

### Q1: ローカル再生とYouTube再生のコンポーネント構造
Story 2・5にある通り、ローカルファイルとYouTubeでは利用できる機能（EQ/音程表示等）が異なります。この2つの再生方式をどう構造化しますか？

A) 共通の「再生インターフェース」を定義し、LocalAudioEngineとYouTubePlayerAdapterをそれぞれ独立したコンポーネントとして実装する（Strategyパターン）。機能差はインターフェースの実装の違いとして表現する

B) 単一のPlaybackコンポーネント内で、入力方式に応じた条件分岐（if/switch）で処理を分ける

C) Other (please describe after [Answer]: tag below)

[Answer]: A（共通インターフェース + Strategyパターン）

### Q2: バックエンドのサービス境界
Story 8（ログイン・クラウド同期）には認証とデータ同期の2つの責務があります。バックエンドのサービス分割はどうしますか？

A) 単一のバックエンドサービスで認証とデータ同期（曲ごとのループ/メモ）の両方を扱う（個人用ツールの規模にはこれで十分）

B) 認証サービスとデータ同期サービスを別々に分ける（将来の拡張性は高いが、個人用ツールにはオーバーヘッドが大きい）

C) Other (please describe after [Answer]: tag below)

[Answer]: A（単一バックエンドサービス）

## Execution Checklist

- [x] Step A: 上記質問の回答を分析し、矛盾・曖昧さがないか確認する（両回答とも推奨案を選択、矛盾なし）
- [x] Step B: コンポーネントを識別し、責務を定義する（components.md）
- [x] Step C: 各コンポーネントのメソッドシグネチャ（概要レベル、詳細な業務ルールはFunctional Designで定義）を定義する（component-methods.md）
- [x] Step D: サービス層（オーケストレーション）を定義する（services.md）
- [x] Step E: コンポーネント間の依存関係・通信パターンを定義する（component-dependency.md）
- [x] Step F: 上記を統合したapplication-design.mdを作成する
- [x] Step G: 設計の一貫性・完全性を検証する（FR1〜FR8/Story1〜8との対応を確認済み）
