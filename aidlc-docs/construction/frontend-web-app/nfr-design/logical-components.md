# Logical Components (NFR対応): Frontend Web App

Application Designのコンポーネントに加え、NFR要件を満たすために以下の論理コンポーネントを追加する。

## LocalStorageAdapter
- **目的**: `SongWorkspaceState`のオフラインファースト保存（NFR: ローカル永続化）
- **責務**: localStorageへのJSON読み書きのラップ、キー設計（`songKey`ごとの名前空間）

## RetryQueueManager
- **目的**: 同期失敗時のリトライ（Resilience: Retry with Exponential Backoff）
- **責務**: `SyncQueueEntry`の管理、指数バックオフでのリトライスケジューリング、オンライン/ログインイベントによる即時リトライのトリガー

## NetworkStatusMonitor
- **目的**: RetryQueueManagerへのトリガー供給
- **責務**: ブラウザの`online`/`offline`イベントを監視し、オンライン復帰をRetryQueueManagerに通知する

## AudioAnalysisLoop
- **目的**: PitchDetector/WaveformVisualizerへのデータ供給（Performance: Throttled Polling）
- **責務**: `requestAnimationFrame`ループで`AnalyserNode`からデータを取得し、間引いてPitchDetector（10〜20Hz）・WaveformVisualizer（30fps）に渡す

## GlobalErrorBoundary
- **目的**: アプリ全体のクラッシュ防止（Reliability）
- **責務**: 未処理例外のキャッチ、汎用エラーメッセージの表示、ErrorToastコンポーネントへの通知

## 既存コンポーネントとの関係
- RetryQueueManagerはSyncOrchestrationServiceから呼ばれ、LocalStorageAdapterはSongWorkspaceの永続化処理から呼ばれる
- AudioAnalysisLoopはPlaybackOrchestrationServiceがLocalAudioEngine接続時に起動し、PitchDetector/WaveformVisualizerにデータを供給する
