# Frontend Components Summary: Frontend Web App

## 再生エンジン層（`frontend/src/playback/`）
- `playbackSource.ts` — `PlaybackSource`インターフェース
- `localAudioEngine.ts` — HTMLAudioElement + Web Audio APIベースの実装。`preservesPitch`でピッチ保持を実現。EQ用BiquadFilterNode、解析用AnalyserNodeを公開
- `youtubePlayerAdapter.ts` — YouTube IFrame Player APIラッパー、簡易ループ（setInterval監視）
- `bassEqProcessor.ts`, `timeStretchProcessor.ts`, `pitchDetector.ts`（pitchyライブラリ利用）, `waveformVisualizer.ts`, `loopEditor.ts`, `audioAnalysisLoop.ts`（共通の間引きポーリングユーティリティ）

## サービス層（`frontend/src/services/`）
- `songWorkspace.ts`, `playbackOrchestrationService.ts`, `syncOrchestrationService.ts`（オフラインファースト保存・指数バックオフ付き再送）

## UIコンポーネント（`frontend/src/components/`）
AuthBar, InputScreen, PlayerScreen, TransportControls, SpeedControl, EQControl, LoopControls, PitchDisplay, WaveformCanvas, MemoEditor, SaveStatusIndicator, ErrorToast, GlobalErrorBoundary。全ての操作可能要素に`data-testid`（命名規則: `{component}-{element-role}`）を付与済み。

## テスト（`frontend/tests/`）
- `playback/loopEditor.test.ts` — フェイクPlaybackSourceを用いたLoopEditorの統合テスト（有効な区間の適用、無効な区間の拒否、ループ解除）
- `components/LoopControls.test.tsx`, `MemoEditor.test.tsx`, `InputScreen.test.tsx` — React Testing Libraryによる主要操作フローの検証

## 既知の制約（レビューでご確認ください）
- **jsdomの制約**: `LocalAudioEngine`自体（AudioContext/BiquadFilterNode等）はjsdomに実装がないため単体テスト対象外。ロジック部分（EQ gainマッピング、速度クランプ、ピッチマッピング等）は`tests/logic/`で検証済み。実際の音声での動作確認はBuild and Testフェーズの手動確認手順に委ねる
- **ループ精度**: ローカル再生のループは`requestAnimationFrame`による監視（約16ms精度）であり、厳密なサンプル精度ではない。YouTubeの簡易ループ（setInterval、約200ms精度）よりは大幅に高精度だが、完全なサンプル精度を要する場合は別実装（AudioBufferSourceNodeのloopStart/loopEnd、ただしpreservesPitchは使えない）が必要になる。現状はpreservesPitchによるピッチ保持を優先した設計判断（localAudioEngine.ts内にコメントで明記）

## 追加パッチ（Unit 2 Functional Design中に発生、2026-10-13）
Backend Sync APIがサーバー側でLast-Write-Winsを強制する設計（409 Conflict + 最新データ返却）に決まったことを受け、`src/api/syncClient.ts`に`ConflictError`（サーバーの最新`SongWorkspaceState`を保持する例外）を追加し、`src/services/syncOrchestrationService.ts`の`save()`・`flushQueue()`が409を他の通信エラーと区別して処理するように修正した。409時は`mergeLastWriteWins`でサーバー側の状態を採用し、ローカル保存・ワークスペースへの反映・再送キューからの削除を行う（無限リトライを防止）。`tests/api/syncClient.test.ts`に409ケースのテストを追加し、`tests/services/syncOrchestrationService.test.ts`を新規作成して競合解決の挙動を検証した（全50テスト成功、ビルド成功）。
