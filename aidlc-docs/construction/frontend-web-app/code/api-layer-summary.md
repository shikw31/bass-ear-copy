# API Layer Summary: Frontend Web App

## 生成されたファイル（`frontend/src/api/`）
- `authClient.ts` — `login`, `logout`, `getCurrentSession`。セッションはバックエンド発行のhttpOnly Cookieに一任し、トークンをフロントエンドで保持しない（SECURITY-12）。`credentials: "include"`でCookie送受信
- `syncClient.ts` — `fetchSongData`, `saveSongData`。404/401時は`null`を返し、オフラインファーストのフォールバック（ローカルのみで継続動作）を妨げない

## テスト（`frontend/tests/api/`）
fetchをモックして、以下を検証:
- 認証: 成功時のSession返却、失敗時の例外、未ログイン(401)時の`null`返却、Cookie送受信オプション(`credentials: "include"`)
- 同期: 404/401時の`null`返却、成功時のデータ整合性、PUT時のURL/ペイロード/Cookieオプション、失敗時の例外

## 連携先（未実装のBackend Sync API、Unit 2）
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/session`
- `GET /songs/{songKey}`, `PUT /songs/{songKey}`

これらのエンドポイントはApplication Design（component-methods.md）とFunctional Design（frontend-components.md）で定義済みの契約に基づく。Unit 2のCode Generationでこの契約通りに実装する。
