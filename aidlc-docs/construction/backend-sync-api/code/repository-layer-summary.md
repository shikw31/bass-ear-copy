# Repository Layer Summary: Backend Sync API

## 生成されたファイル（`backend/src/stores/`）
- `redisClient.ts` — Upstash Redisクライアントの共有生成（環境変数から遅延初期化）
- `userStore.ts` — `findByEmail`, `create`（事前プロビジョニング用）
- `sessionStore.ts` — `create`, `find`, `extend`（スライディング延長時にTTLも更新）, `delete`
- `songRecordStore.ts` — `find(userId, songKey)`, `save`（userId+songKeyでスコープ）

全てのストアはコンストラクタでRedisクライアントを受け取れる設計（デフォルトは共有クライアント）にし、テスト時にインメモリのフェイク実装に差し替え可能にしている。

## テスト（`backend/tests/stores/`）
`fakeRedis.ts`（get/set/delのみを実装するインメモリフェイク）を使い、実際のUpstash認証情報なしで以下を検証:
- 存在しないキーの`null`返却
- 作成したレコードの往復性
- `userId`によるスコープ分離（他ユーザーのレコードと混ざらない）
- セッションの削除・延長の反映
