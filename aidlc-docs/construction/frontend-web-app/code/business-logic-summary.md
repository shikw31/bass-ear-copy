# Business Logic Summary: Frontend Web App

## 生成されたファイル（`frontend/src/`）
- `domain/types.ts` — domain-entities.md準拠の型定義（Song, LoopPoints, Memo, SongWorkspaceState, PitchResult, PlaybackCapabilities, Session, SyncQueueEntry）
- `logic/songKey.ts` — ローカルファイルのSHA-256ハッシュ、YouTube URLの動画ID正規化
- `logic/capabilities.ts` — PlaybackCapabilities判定
- `logic/validation.ts` — ファイル形式/サイズ、YouTube URL、メモ文字数、ループ区間の検証
- `logic/bassEqGain.ts` — EQ gainのクランプ・線形ゲイン変換（恒等性・単調性）
- `logic/timeStretchRate.ts` — 再生速度のクランプ
- `logic/pitchMapping.ts` — 周波数→音名マッピング、ベース帯域ゲーティング
- `logic/mergeLastWriteWins.ts` — 同期競合解決
- `logic/localStorageAdapter.ts` — オフラインファースト永続化（try/catchでガード）
- `logic/retryQueueManager.ts` — 指数バックオフ付きリトライキュー
- `logic/networkStatusMonitor.ts` — オンライン復帰検知

## テスト（`frontend/tests/logic/`）
全てVitest + fast-check（PBT-09準拠）。business-logic-model.mdのPBT-01 Property識別表に対応するPBTテストと、代表的な具体例を検証する例示ベーステスト（PBT-10準拠）を併置した。

| テストファイル | 検証内容 |
|---|---|
| songKey.test.ts | 同一内容ファイルの決定性（PBT-02/03）、YouTube URLのクエリパラメータ差異に対する不変性 |
| capabilities.test.ts | Local/YouTubeの機能可否（例示ベース） |
| validation.test.ts | ループ区間検証の不変条件（PBT-03）・拒否の冪等性（PBT-04） |
| bassEqGain.test.ts | gain=0の恒等性、単調性（PBT-03）、範囲クランプ |
| timeStretchRate.test.ts | 速度の範囲制約（PBT-03） |
| pitchMapping.test.ts | 既知周波数→音名のOracle比較（PBT-05）、帯域/信頼度ゲーティング |
| mergeLastWriteWins.test.ts | Last-Write-Wins不変条件（PBT-03）、マージの冪等性（PBT-04） |

## 検証結果
Code Generation時点で以下を実行し、全て成功を確認済み（通常はBuild and Testフェーズで実行する内容だが、早期に検証した）:
- `npx tsc --noEmit` — 型エラーなし
- `npx vitest run` — 13テストファイル / 48テスト全て成功
- `npm run build` — 本番ビルド成功
- `npm audit` — 0件の脆弱性（依存パッケージはpackage.json記載の2026-10-13時点の最新パッチ版に更新済み。当初案のバージョン指定に既知の脆弱性（esbuild/tinypool）があったため、React 19/Vite 8/Vitest 5系列へ更新した）

## 既知の制約
- タイムストレッチの「実際の音声でピッチが保たれるか」はブラウザの`preservesPitch`機能（ネイティブ実装）に依存するため、単体テストでは速度クランプ処理のみを検証している。実際の音声での確認はBuild and Testフェーズの手動確認手順でカバーする
- ピッチ検出の時間領域解析（FFT/自己相関）自体はpitchyライブラリに委譲しており、本Unitのテストはそのラッパー（周波数→音名マッピング、帯域ゲーティング）のみを対象とする
