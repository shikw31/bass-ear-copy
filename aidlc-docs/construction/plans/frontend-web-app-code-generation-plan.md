# Code Generation Plan: Frontend Web App

## Unit Context
- **Unit**: Frontend Web App（`frontend/`、ワークスペースルート: `/Users/shikw31/Documents/bass-ear-copy`）
- **対象ストーリー**: Story 1〜8（全て。Story 7・8はローカル保存部分をこのUnitで実装し、バックエンド連携APIクライアントまでを実装。実際のバックエンドはUnit 2で実装）
- **依存**: Backend Sync API（Unit 2、未実装）に対してAuthClient/SyncClientがHTTP呼び出しを行う。Unit 2実装前は、Application Design/Functional Designで確定したAPI契約（`GET/PUT /songs/{songKey}`, `POST /auth/login`, `POST /auth/logout`）を前提にモックテストで検証する
- **参照設計**: components.md, component-methods.md, services.md, component-dependency.md（Application Design）/ business-logic-model.md, business-rules.md, domain-entities.md, frontend-components.md（Functional Design）/ nfr-design-patterns.md, logical-components.md（NFR Design）/ infrastructure-design.md, deployment-architecture.md（Infrastructure Design）
- **技術スタック**: React + TypeScript + Vite, Web Audio API, pitchy, Vitest + fast-check（PBT-09）

## コード配置方針
- Greenfield・2 Unit構成（モノレポ）のため: `frontend/src/`, `frontend/tests/`
- ドキュメント（本サマリー類）は`aidlc-docs/construction/frontend-web-app/code/`にMarkdownで作成する

## Steps

- [x] **Step 1: Project Structure Setup**
  - `frontend/package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `.env.example`, `.gitignore`を作成
  - 依存: react, react-dom, pitchy, vite, typescript, vitest, fast-check, @testing-library/react, jsdom
  - Story: 基盤（全ストーリー共通）

- [x] **Step 2: Business Logic Generation**
  - `src/domain/types.ts`（domain-entities.md準拠: Song, LoopPoints, Memo, SongWorkspaceState, PitchResult, PlaybackCapabilities, Session, SyncQueueEntry）
  - `src/logic/songKey.ts`（ローカルファイルハッシュ／YouTube URL正規化）
  - `src/logic/capabilities.ts`（PlaybackCapabilities判定）
  - `src/logic/validation.ts`（入力検証: ファイル形式/サイズ, YouTube URL, メモ文字数, ループ区間）
  - `src/logic/bassEqGain.ts`（EQ gainマッピング、恒等性・単調性ロジック）
  - `src/logic/timeStretchRate.ts`（速度クランプロジック）
  - `src/logic/pitchMapping.ts`（周波数→音名マッピング、対象帯域/信頼度ゲート）
  - `src/logic/mergeLastWriteWins.ts`（同期競合解決ロジック）
  - `src/logic/localStorageAdapter.ts`
  - `src/logic/retryQueueManager.ts`
  - `src/logic/networkStatusMonitor.ts`
  - Story: 2, 3, 4, 5, 6, 7, 8（ロジック部分）

- [x] **Step 3: Business Logic Unit Testing**
  - `tests/logic/songKey.test.ts`, `tests/logic/capabilities.test.ts`, `tests/logic/validation.test.ts`, `tests/logic/bassEqGain.test.ts`, `tests/logic/timeStretchRate.test.ts`, `tests/logic/pitchMapping.test.ts`, `tests/logic/mergeLastWriteWins.test.ts`
  - fast-checkによるPBTテスト（business-logic-model.mdのProperty識別表に対応: Idempotence, Invariant, Range constraint, Oracle）
  - 例示ベーステスト（PBT-10準拠、既知シナリオを固定値で検証）も併置

- [x] **Step 4: Business Logic Summary**
  - `aidlc-docs/construction/frontend-web-app/code/business-logic-summary.md`

- [x] **Step 5: API Layer Generation**
  - `src/api/authClient.ts`（login/logout/getCurrentSession、Cookieベース）
  - `src/api/syncClient.ts`（fetchSongData/saveSongData）
  - Story: 8（AuthClient）, 7（SyncClient）

- [x] **Step 6: API Layer Unit Testing**
  - `tests/api/authClient.test.ts`, `tests/api/syncClient.test.ts`（fetchをモックし、API契約に基づくリクエスト/レスポンス処理を検証）

- [x] **Step 7: API Layer Summary**
  - `aidlc-docs/construction/frontend-web-app/code/api-layer-summary.md`

- [x] **Step 8: Repository Layer — N/A**
  - フロントエンドUnitは直接データベースを持たない（SongDataStoreはBackend Sync API/Unit 2の責務）。N/Aとして記録済み

- [x] **Step 9: Frontend Components Generation（再生エンジン・オーケストレーション・UI）**
  - `src/playback/playbackSource.ts`（インターフェース）
  - `src/playback/localAudioEngine.ts`（PlaybackSource実装、BiquadFilterNode経由EQ接続、preservesPitchタイムストレッチ、AnalyserNode公開）
  - `src/playback/youtubePlayerAdapter.ts`（PlaybackSource実装、YouTube IFrame Player API）
  - `src/playback/audioAnalysisLoop.ts`（requestAnimationFrameポーリング、pitchy連携）
  - `src/services/songWorkspace.ts`
  - `src/services/playbackOrchestrationService.ts`
  - `src/services/syncOrchestrationService.ts`
  - `src/components/AuthBar.tsx`, `InputScreen.tsx`, `PlayerScreen.tsx`, `TransportControls.tsx`, `SpeedControl.tsx`, `EQControl.tsx`, `LoopControls.tsx`, `PitchDisplay.tsx`, `WaveformCanvas.tsx`, `MemoEditor.tsx`, `SaveStatusIndicator.tsx`, `ErrorToast.tsx`, `GlobalErrorBoundary.tsx`
  - `src/App.tsx`, `src/main.tsx`
  - 全コンポーネントにdata-testid属性を付与（命名規則: `{component}-{element-role}`）
  - Story: 1, 2, 3, 4, 5, 6, 7, 8（UI/オーケストレーション全体）

- [x] **Step 10: Frontend Components Unit Testing**
  - `tests/playback/localAudioEngine.test.ts`（loopEditor検証ロジックとの結合、capabilities判定）
  - `tests/components/LoopControls.test.tsx`, `tests/components/MemoEditor.test.tsx`, `tests/components/InputScreen.test.tsx`（React Testing Libraryによる主要操作フローの検証）

- [x] **Step 11: Frontend Components Summary**
  - `aidlc-docs/construction/frontend-web-app/code/frontend-components-summary.md`

- [x] **Step 12: Database Migration Scripts — N/A**
  - フロントエンドUnitにデータベースは存在しない。N/Aとして記録済み

- [x] **Step 13: Documentation Generation**
  - `frontend/README.md`（セットアップ・起動・テスト実行方法、環境変数）

- [x] **Step 14: Deployment Artifacts Generation**
  - `frontend/vercel.json`（infrastructure-design.md準拠のHTTPヘッダー設定。CSPのconnect-srcはBackend Sync APIの実URL確定後に`https://*.vercel.app`から絞り込みが必要 — Build and Testフェーズまたはデプロイ時に要対応として記録）
