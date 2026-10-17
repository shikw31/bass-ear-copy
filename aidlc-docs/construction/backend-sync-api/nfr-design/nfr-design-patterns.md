# NFR Design Patterns: Backend Sync API

## Resilience: Minimal（Resiliency Baseline拡張は無効）
- Upstash Redisへの全呼び出しはtry/catchで処理し、失敗時は500エラー（汎用メッセージ）を返す。複雑なリトライ/サーキットブレーカーは導入しない（個人用ツールのスコープ外、NFR Requirements参照）

## Performance: HTTPベースのRedisクライアント
- `@upstash/redis`（REST/HTTPベース）を使用する。従来のTCPコネクション型Redisクライアントと異なり、サーバーレス関数の短命な実行環境でもコネクションプーリングの問題が発生しない

## Security: Middleware-Based Enforcement
- **認証ミドルウェア**: `/songs/*`配下の全ルートに適用するHonoミドルウェアで、Cookieのセッション検証（deny-by-default、SECURITY-08）を行い、検証成功時のみ`userId`をリクエストコンテキストに設定する
- **CORS**: Honoの`cors()`ミドルウェアを使い、許可オリジンをフロントエンドのVercel URLのみに限定する（SECURITY-08）
- **レート制限**: `@upstash/ratelimit`（Upstash Redisと統合するスライディングウィンドウ方式）を`/auth/login`に適用する（SECURITY-11, SECURITY-12）
- **グローバルエラーハンドラ**: Honoの`app.onError()`で未処理例外をキャッチし、ログに詳細を出力しつつ、クライアントには汎用エラーメッセージのみ返す（SECURITY-09, SECURITY-15）

## Reliability: Fail-Closed Defaults
- 認証ミドルウェアでセッション検証に失敗した場合は常に401を返す（fail closed、SECURITY-15）
- Upstash Redis呼び出し失敗時は、曖昧な部分的成功状態を作らないよう、書き込み操作は全体を1回のRedisコマンド（ハッシュ/JSON文字列のセット）で完結させる
