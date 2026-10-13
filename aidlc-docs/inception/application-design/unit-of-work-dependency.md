# Unit Dependency: 耳コピ補助アプリ

## 依存関係マトリクス

| Unit | 依存先Unit | 依存の種類 |
|---|---|---|
| Frontend Web App | Backend Sync API | 一方向（HTTP API呼び出し: AuthClient/SyncClient → AppBackendAPI）。Backend Sync APIはFrontendに依存しない |
| Backend Sync API | （なし） | 他Unitへの依存なし |

循環依存はない。

## 補足: 機能ごとの依存の有無
- Story 1〜6（Webアプリアクセス、音源入力、低音域EQ、スロー再生、A-Bループ、音程/波形可視化）は**Frontend Web App単体で動作**し、Backend Sync APIへの依存はない
- Story 7〜8（曲ごとのデータ保存、ログイン・クラウド同期）のみがBackend Sync APIへの依存を持つ

## Unit更新・開発順序に関する推奨
- Backend Sync APIはFrontendに依存しないため、どちらを先に開発してもよい
- MVP最優先機能（低音域EQ、要件分析時に確認済み）はFrontend単体で完結するため、**Frontend Web Appを先行して開発・動作確認し、後からBackend Sync APIとの連携（Story 7, 8）を追加する順序**を推奨する
- Code Generation（per-unit）の実施順序は、この推奨に基づき次フェーズで確定する
