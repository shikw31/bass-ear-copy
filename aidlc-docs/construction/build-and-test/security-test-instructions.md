# Security Test Instructions

Security Baseline拡張が有効（全ルール適用）のため、以下を確認する。

## 依存関係の脆弱性スキャン（SECURITY-10）
```bash
cd frontend && npm audit   # 検証済み: 0件（2026-10-13）
cd backend && npm audit    # 検証済み: 0件（2026-10-17）
```
今後、依存関係を更新した際は毎回実行して0件を維持する。

## 認証・認可（SECURITY-08, SECURITY-12）
Backend起動後（Scenario 2参照）、以下を確認する:
```bash
# 未認証アクセスは401（deny-by-default）— 検証済み
curl -i http://localhost:8787/songs/local:$(printf 'a%.0s' {1..64})

# 誤ったパスワード・存在しないメールアドレスで同じ汎用エラーになること（ユーザー列挙対策）
curl -s -X POST http://localhost:8787/auth/login -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"wrong"}'
curl -s -X POST http://localhost:8787/auth/login -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com","password":"whatever123"}'
# => 両方とも同じ error メッセージであること（単体テストで検証済み、backend/tests/routes/authRoutes.test.ts）
```

## セッションCookieの属性確認（SECURITY-12）
ログイン成功時のレスポンスヘッダーで、`Set-Cookie`に`HttpOnly`, `Secure`, `SameSite=Lax`が含まれることを確認する（本番環境＝HTTPSで確認。`Secure`属性はHTTP環境では無視されるためローカルhttpでは動作検証のみ、属性自体はレスポンスヘッダーで目視確認）

## 入力検証（SECURITY-05）
以下のような不正な入力に対して400が返ることを確認する（`backend/tests/logic/validation.test.ts`で単体テスト済み、API経由でも再確認する場合）:
- 不正な形式の`songKey`
- 2000文字を超えるメモ
- `a >= b`のループ区間

## CORS（SECURITY-08）
`FRONTEND_ORIGIN`以外のOriginからのクロスオリジンリクエストが拒否されることを、ブラウザの開発者ツール（Network/Consoleタブ）でCORSエラーが出ることを確認する

## HTTPセキュリティヘッダー（SECURITY-04, 両Unitのvercel.json参照）
デプロイ後、以下で確認する:
```bash
curl -I https://<frontend-url>   # CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
curl -I https://<backend-url>/health   # HSTS, X-Content-Type-Options
```

## 既知の未実施項目
- 本格的なペネトレーションテスト・脆弱性スキャンツール（OWASP ZAP等）の実行は、個人用ツールの規模に対して過剰と判断しスコープ外とした
