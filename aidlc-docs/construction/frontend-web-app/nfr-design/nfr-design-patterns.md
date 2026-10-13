# NFR Design Patterns: Frontend Web App

## Resilience: Retry with Exponential Backoff
- 同期（SyncClient.saveSongData / fetchSongData）が失敗した場合、指数バックオフ（1秒 → 2秒 → 4秒 … 最大30秒間隔）でリトライする
- オンライン/ログイン状態になったタイミングでも即座にリトライをトリガーする（ブラウザの`online`イベント、ログイン成功イベントをフックする）
- 最大試行回数の上限なし。ユーザーデータ（SyncQueueEntry）は送信成功まで保持する

## Performance: Throttled Polling（AudioWorklet不使用）
- `AnalyserNode`から`requestAnimationFrame`でデータを取得し、以下の頻度に間引く:
  - PitchDetector: 10〜20Hzに間引いてpitchyライブラリへ渡す
  - WaveformVisualizer: 30fpsで描画
- BassEQProcessorは`BiquadFilterNode`（ネイティブWeb Audio API）を使用し、ブラウザのオーディオレンダリングスレッドで自動処理されるため、追加の最適化パターンは不要

## Security: Header Enforcement（配置先はInfrastructure Designで確定）
- SECURITY-04で定義されたHTTPセキュリティヘッダー（CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy）は、全HTMLレスポンスに適用される要件として引き継ぐ。具体的な設定箇所（静的ホスティングサービスの設定、リバースプロキシ等）はInfrastructure Designで決定する
- 依存ライブラリはnpmでビルド時にバンドルするため、CDN経由スクリプト読み込みは行わない（SRI対象外）

## Reliability: Global Error Boundary（SECURITY-15準拠）
- Reactのトップレベルに Error Boundaryを配置し、未処理の例外をキャッチしてユーザーに汎用的なエラーメッセージを表示する（内部スタックトレース等は表示しない）
- 音声処理（デコード、フィルタ適用等）のエラーは個別にtry/catchし、該当機能のみ無効化してアプリ全体のクラッシュを防ぐ
