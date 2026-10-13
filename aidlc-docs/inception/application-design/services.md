# Services: 耳コピ補助アプリ

## PlaybackOrchestrationService（フロントエンド）
- **責務**: 入力（ローカルファイル/YouTube URL）を受け取り、適切なPlaybackSourceを選択・初期化し、ローカル入力の場合のみEQ/タイムストレッチ/ピッチ検出/波形表示の各プロセッサを接続する
- **オーケストレーション対象**: AudioInputManager → PlaybackSource（LocalAudioEngine または YouTubePlayerAdapter）→（Localの場合のみ）BassEQProcessor, TimeStretchProcessor, PitchDetector, WaveformVisualizer → LoopEditor → SongWorkspace

## SyncOrchestrationService（フロントエンド）
- **責務**: 曲を開いたときに保存済みデータを復元し、保存操作時にバックエンドへ送信する
- **オーケストレーション対象**: AuthClient（ログイン状態確認）→ SyncClient（データ取得/保存）→ SongWorkspace（状態のインポート/エクスポート）
- **トリガー**: 曲を開いたとき（自動ロード）、ユーザーが保存操作を行ったとき（明示的保存）

## AppBackendAPI（バックエンド、単一サービス）
- **責務**: 外部からの全リクエストの受付、認証トークン検証（deny-by-default、SECURITY-08）、AuthServiceとSongDataServiceへのルーティング
- **オーケストレーション対象**: 受信リクエスト → トークン検証（AuthService.validateToken）→ 認可済みリクエストのみ SongDataService に委譲

## 設計原則
- Q2回答により、認証とデータ同期は単一バックエンドサービス内の別コンポーネント（AuthService, SongDataService）として実装し、別々のサービスには分割しない（個人用ツールの規模に合わせたシンプルな構成）
- フロントエンドのオーケストレーションサービスは、ローカル/YouTubeの機能差をPlaybackSourceのcapabilitiesを通じて吸収し、呼び出し側（UI）には差異を見せない
