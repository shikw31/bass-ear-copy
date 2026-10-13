# Application Design: 耳コピ補助アプリ（統合ドキュメント）

本ドキュメントは以下を統合したサマリーです。詳細は各ファイルを参照してください。
- [components.md](./components.md)
- [component-methods.md](./component-methods.md)
- [services.md](./services.md)
- [component-dependency.md](./component-dependency.md)

## 設計方針（確認済み回答）
- **再生方式の構造**: 共通インターフェース`PlaybackSource`を定義し、`LocalAudioEngine`と`YouTubePlayerAdapter`を別コンポーネントとして実装（Strategyパターン）
- **バックエンドのサービス境界**: 単一バックエンドサービス（`AppBackendAPI`）内に`AuthService`と`SongDataService`を配置（個人用ツールの規模に合わせたシンプルな構成）

## コンポーネント一覧（概要）

**フロントエンド**: AudioInputManager, PlaybackSource（インターフェース）, LocalAudioEngine, YouTubePlayerAdapter, BassEQProcessor, TimeStretchProcessor, PitchDetector, WaveformVisualizer, LoopEditor, SongWorkspace, AuthClient, SyncClient

**バックエンド（単一サービス）**: AppBackendAPI, AuthService, SongDataService, SongDataStore

**オーケストレーションサービス**: PlaybackOrchestrationService（フロントエンド）, SyncOrchestrationService（フロントエンド）

## 要件・ストーリーとのトレーサビリティ

| FR / Story | 関連コンポーネント |
|---|---|
| FR1 / Story 1（Webアプリアクセス） | 全コンポーネント（基盤） |
| FR2 / Story 2（音源入力） | AudioInputManager, LocalAudioEngine, YouTubePlayerAdapter |
| FR3 / Story 3（低音域EQ） | BassEQProcessor |
| FR4 / Story 4（スロー再生） | TimeStretchProcessor |
| FR5 / Story 5（A-Bループ） | LoopEditor, PlaybackSource |
| FR6 / Story 6（音程・波形可視化） | PitchDetector, WaveformVisualizer |
| FR7 / Story 7（曲ごとのデータ保存） | SongWorkspace, SyncClient, SongDataService, SongDataStore |
| FR8 / Story 8（ログイン・クラウド同期） | AuthClient, AuthService, SyncOrchestrationService, AppBackendAPI |

## Security Compliance（この段階で評価可能なもの）

| Rule | 状態 | 根拠 |
|---|---|---|
| SECURITY-08（アプリケーションレベルのアクセス制御） | Compliant | AppBackendAPIがdeny-by-defaultでトークン検証を行い、SongDataServiceがuserIdでスコープしたオブジェクトレベル権限チェックを行う設計 |
| SECURITY-11（セキュア設計原則） | Compliant | AuthServiceとSongDataServiceを責務分離。不正アクセス（他ユーザーのデータ取得）という誤用ケースを設計時点で考慮済み |
| SECURITY-12（認証・認証情報管理） | N/A（この段階） | AuthServiceコンポーネントの存在までは定義。パスワードハッシュ化・MFA・セッション管理の詳細はFunctional Design/NFR Designで定義 |
| SECURITY-01, 02, 03, 04, 05, 06, 07, 09, 10, 13, 14, 15 | N/A（この段階） | インフラ/実装レベルのルールのため、NFR Design・Infrastructure Design・Code Generationで評価 |

## PBT Compliance（この段階で評価可能なもの）

| Rule | 状態 | 根拠 |
|---|---|---|
| PBT-01〜10 | N/A（この段階） | Property識別（PBT-01）はFunctional Designで実施。本段階はコンポーネント・メソッドシグネチャ定義までのため対象外 |
