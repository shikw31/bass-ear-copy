# Unit ⇔ Story Mapping: 耳コピ補助アプリ

| Story | 概要 | Frontend Web App | Backend Sync API |
|---|---|---|---|
| Story 1 | Webアプリへのアクセス | ✅ | - |
| Story 2 | 音源入力（ローカルファイル／YouTube） | ✅ | - |
| Story 3 | 低音域強調EQ | ✅ | - |
| Story 4 | スロー再生 | ✅ | - |
| Story 5 | A-Bループ再生 | ✅ | - |
| Story 6 | 音程・波形の可視化 | ✅ | - |
| Story 7 | 曲ごとのデータ保存 | ✅（SongWorkspace, SyncClient） | ✅（SongDataService, SongDataStore） |
| Story 8 | ログイン・クラウド同期 | ✅（AuthClient, SyncOrchestrationService） | ✅（AuthService, AppBackendAPI） |

全8ストーリーがいずれかのUnit（または両方）に割り当て済み。未割り当てのストーリーはない。
