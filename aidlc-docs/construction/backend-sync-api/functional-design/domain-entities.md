# Domain Entities: Backend Sync API

## User
- `userId: string`
- `email: string`
- `passwordHash: string`（アダプティブハッシュアルゴリズムの出力、SECURITY-12）
- `createdAt: number`

事前プロビジョニング（Q1回答）のため、本バージョンではレコードは1件のみ想定。将来の多ユーザー化があっても構造はそのまま使える。

## Session
- `sessionId: string`（Cookieに格納する値。SECURITY-12準拠でSecure/HttpOnly/SameSite属性を付与）
- `userId: string`
- `createdAt: number`
- `expiresAt: number`（30日間スライディング。アクセスごとに延長）

## SongRecord（SongDataServiceが管理）
- `userId: string`
- `songKey: string`
- `loopPoints: { a: number, b: number, enabled: boolean } | null`
- `memo: { text: string, updatedAt: number } | null`
- `updatedAt: number`（Last-Write-Wins判定の基準。Unit 1のSongWorkspaceStateと同じ意味）

## エンティティ関係
- `User` 1 — 0..* `Session`（複数端末で同時ログイン可能、ログアウトは該当Sessionのみ失効）
- `User` 1 — 0..* `SongRecord`（`userId + songKey`で一意）
- `SongRecord`はUnit 1の`SongWorkspaceState`と対になる（フィールド構成は同一。`userId`が追加されている点のみ異なる）
