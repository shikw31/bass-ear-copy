# Units of Work: 耳コピ補助アプリ

## 決定事項（確認済み回答）
- **Unit境界**: 2つの独立したUnit（Frontend Web App / Backend Sync API）に分離し、それぞれ個別にデプロイ・テスト可能にする
- **リポジトリ構成**: モノレポ。ワークスペースルートに `frontend/` と `backend/` のサブディレクトリを配置する

## Unit 1: Frontend Web App

- **責務**: ユーザーが直接操作する全機能（音源入力、低音域EQ、スロー再生、A-Bループ、音程/波形表示、曲データの保存操作・ログインUI）を提供するWebアプリ
- **含まれるコンポーネント**: AudioInputManager, PlaybackSource（インターフェース）, LocalAudioEngine, YouTubePlayerAdapter, BassEQProcessor, TimeStretchProcessor, PitchDetector, WaveformVisualizer, LoopEditor, SongWorkspace, AuthClient, SyncClient, PlaybackOrchestrationService, SyncOrchestrationService
- **関連FR**: FR1〜FR8（全て。FR7/FR8はBackend Sync APIとの連携が必要）
- **ディレクトリ**: `frontend/`

## Unit 2: Backend Sync API

- **責務**: ユーザー認証と、曲ごとのループ区間/メモの永続化・同期を提供する単一バックエンドサービス
- **含まれるコンポーネント**: AppBackendAPI, AuthService, SongDataService, SongDataStore
- **関連FR**: FR7（データ保存）, FR8（ログイン・クラウド同期）
- **ディレクトリ**: `backend/`

## コード構成方針（Greenfield）

```
bass-ear-copy/                  <- ワークスペースルート（アプリケーションコード）
├── frontend/                   <- Unit 1
├── backend/                    <- Unit 2
└── aidlc-docs/                 <- ドキュメントのみ（既存）
```

具体的な技術スタック（フレームワーク、言語、DB等）はNFR Requirements（per-unit）で決定する。
