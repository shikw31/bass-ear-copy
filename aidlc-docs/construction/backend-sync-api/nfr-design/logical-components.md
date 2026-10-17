# Logical Components (NFR対応): Backend Sync API

Application Designのコンポーネント（AppBackendAPI, AuthService, SongDataService, SongDataStore）に加え、NFR要件を満たすために以下の論理コンポーネントを追加する。

## SessionStore
- **目的**: Session（sessionId, userId, expiresAt）の永続化
- **責務**: Upstash Redisへの読み書き（キー: `session:{sessionId}`）、TTLによる自動失効（RedisのEXPIRE機能をスライディング延長に利用）

## SongRecordStore（SongDataStoreの実装）
- **目的**: SongRecordの永続化
- **責務**: Upstash Redisへの読み書き（キー: `song:{userId}:{songKey}`）

## UserStore
- **目的**: 事前プロビジョニングされた単一Userレコードの参照
- **責務**: Upstash Redisからのemail/passwordHash読み取り（キー: `user:{email}`）

## RateLimiter
- **目的**: ログインエンドポイントのブルートフォース対策
- **責務**: `@upstash/ratelimit`を用いたIPアドレス単位のスライディングウィンドウ制限

## AuthMiddleware
- **目的**: `/songs/*`配下のdeny-by-defaultアクセス制御
- **責務**: Cookieからsession IDを取り出し、SessionStore経由で検証、成功時のみ`userId`をコンテキストに設定して次のハンドラに進む。失敗時は401を返す

## GlobalErrorHandler
- **目的**: 未処理例外の一元処理
- **責務**: Honoの`app.onError()`に登録し、ログ出力と汎用エラーレスポンスを行う

## 既存コンポーネントとの関係
- AuthServiceはSessionStore・UserStoreを利用する
- SongDataServiceはSongRecordStoreを利用する
- AppBackendAPIはAuthMiddleware・RateLimiter・GlobalErrorHandlerを経由してAuthService/SongDataServiceにルーティングする
