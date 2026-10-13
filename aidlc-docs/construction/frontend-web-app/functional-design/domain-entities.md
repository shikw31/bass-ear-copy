# Domain Entities: Frontend Web App

## Song
- `songKey: string` — 一意識別子（ローカル: ファイルのハッシュ値／YouTube: 正規化されたURLから抽出した動画ID）
- `sourceType: "local" | "youtube"`
- `displayName: string` — ファイル名、またはYouTube動画のタイトル/URL
- `durationSec: number`

## LoopPoints
- `a: number` — ループ開始位置（秒）
- `b: number` — ループ終了位置（秒）
- `enabled: boolean`
- 制約: `0 <= a < b <= duration` かつ `b - a >= 0.5`（business-rules.md参照）

## Memo
- `text: string`（最大2000文字）
- `updatedAt: timestamp`

## SongWorkspaceState（永続化・同期の単位）
- `songKey: string`
- `loopPoints: LoopPoints | null`
- `memo: Memo | null`
- `updatedAt: timestamp` — Last-Write-Wins判定に使用

## PitchResult
- `noteName: string | null` — 例: "E2"。検出不能時はnull
- `frequencyHz: number | null`
- `confidence: number`（0.0〜1.0）
- `detected: boolean` — confidenceが閾値未満、または対象帯域（約41Hz〜400Hz）外の場合false

## PlaybackCapabilities
- `supportsEQ: boolean`
- `supportsPitchDisplay: boolean`
- `supportsWaveform: boolean`
- `supportsSpeedChange: boolean`
- `loopPrecision: "sample" | "approximate"`

## Session
- `userId: string`
- `token: string`
- `expiresAt: timestamp`

## SyncQueueEntry（オフラインファースト対応）
- `songKey: string`
- `state: SongWorkspaceState`
- `queuedAt: timestamp`
- 用途: 未ログイン/オフライン時に保存されたSongWorkspaceStateを保持し、ログイン/オンライン復帰時にバックエンドへ送信するためのキュー

## エンティティ関係
- `Song` 1 — 1 `SongWorkspaceState`（songKeyで対応）
- `SongWorkspaceState` 1 — 0..1 `LoopPoints`, 0..1 `Memo`
- `SyncQueueEntry` は未送信の`SongWorkspaceState`を参照（songKeyごとに最新の1件のみ保持、古いキュー項目は上書きされる）
- `Session`はSyncOrchestrationServiceが同期可否を判定する際に参照する（ログイン状態の有無のみ、Song/SongWorkspaceStateとは直接関連しない）
