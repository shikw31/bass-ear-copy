# Components: 耳コピ補助アプリ

設計方針: Q1回答により、ローカル再生とYouTube再生は共通インターフェース（`PlaybackSource`）を実装する別コンポーネントとする（Strategyパターン）。Q2回答により、バックエンドは単一サービスとする。

## フロントエンド・コンポーネント

### AudioInputManager
- **目的**: ユーザーが指定した入力（ローカルファイル or YouTube URL）を判別し、適切な`PlaybackSource`実装を生成する
- **責務**: 入力タイプ判定、ファイル形式の妥当性チェック、YouTube URLの妥当性チェック

### PlaybackSource（インターフェース）
- **目的**: ローカル再生とYouTube再生を同じ方法で操作できるようにする共通契約
- **責務**: 再生・一時停止・シーク・ループ設定・再生時間取得・対応機能（capabilities）の公開

### LocalAudioEngine（PlaybackSourceを実装）
- **目的**: ローカル音声ファイルのデコードとWeb Audio APIベースの再生制御
- **責務**: 音声デコード、サンプル精度のA-Bループ、再生位置管理。EQ/タイムストレッチ/ピッチ検出/波形表示の各プロセッサが接続する音声グラフを提供する

### YouTubePlayerAdapter（PlaybackSourceを実装）
- **目的**: YouTube IFrame Player APIのラップ
- **責務**: 動画埋め込み再生、YouTube標準の再生速度変更（音程保持）、シークベースの簡易A-Bループ

### BassEQProcessor
- **目的**: 低音域強調EQ（FR3）
- **責務**: LocalAudioEngineの音声グラフに接続し、低音域帯域のgainを調整する

### TimeStretchProcessor
- **目的**: 音程保持のスロー再生（FR4）
- **責務**: LocalAudioEngineの音声グラフに接続し、再生速度を変更しても音程を保持する

### PitchDetector
- **目的**: リアルタイム音名/周波数表示（FR6.1）
- **責務**: LocalAudioEngineの音声グラフから基音を検出し、音名・周波数・検出不能状態を通知する

### WaveformVisualizer
- **目的**: 波形/スペクトログラム表示（FR6.2）
- **責務**: LocalAudioEngineの音声バッファを可視化する

### LoopEditor
- **目的**: A-Bループ区間の指定（FR5）
- **責務**: 任意の`PlaybackSource`に対してループ区間を設定・解除する。精度はPlaybackSourceのcapabilitiesに依存する

### SongWorkspace
- **目的**: 1曲分の作業状態（再生、EQ、ループ、メモ）をまとめる集約コンポーネント（FR2, FR5, FR7）
- **責務**: AudioInputManager/PlaybackSource/各プロセッサ/LoopEditor/メモの保持、曲を識別するSongKey（ファイルハッシュまたは正規化したYouTube URL）の管理、状態のエクスポート/インポート（同期用）

### AuthClient
- **目的**: ログイン状態の管理（FR8）
- **責務**: 認証処理の呼び出し、セッション情報の保持

### SyncClient
- **目的**: バックエンドとの曲データ同期（FR7, FR8）
- **責務**: 曲ごとのループ区間/メモの取得・保存APIの呼び出し

## バックエンド・コンポーネント（単一サービス内）

### AppBackendAPI
- **目的**: バックエンドの単一エントリーポイント
- **責務**: リクエストのルーティング、認証ミドルウェアによるトークン検証（deny-by-default、SECURITY-08）

### AuthService
- **目的**: ユーザー認証（FR8）
- **責務**: ログイン、トークン発行・検証、セッション管理（SECURITY-12）

### SongDataService
- **目的**: 曲ごとのループ区間/メモの永続化（FR7, FR8）
- **責務**: ユーザーIDでスコープされたCRUD操作（SECURITY-08: オブジェクトレベル権限チェック）

### SongDataStore
- **目的**: データ永続化の抽象化
- **責務**: データベースへの読み書き（具体的な技術選定はNFR Requirements/Infrastructure Designで決定）
