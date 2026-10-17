# NFR Requirements: Backend Sync API

## パフォーマンス
- API応答: 目安1秒以内（サーバーレスのCold Start込み）

## 可用性・スケーラビリティ
- 個人用ツールのため、可用性SLA・水平スケーリング要件は設定しない（Resiliency Baseline拡張は無効化済み）
- Upstash Redis・Vercel Functionsはいずれもマネージドサービスのため、基本的な可用性はプラットフォームに依存する

## セキュリティ（Security Baseline拡張: 有効、全ルール適用）
- パスワードハッシュ: `bcryptjs`（アダプティブアルゴリズム、SECURITY-12）
- セッションCookie: `Secure`, `HttpOnly`, `SameSite=Lax`属性（SECURITY-12）
- CORS: フロントエンドのオリジンのみ許可、認証済みエンドポイントでワイルドカード不可（SECURITY-08）
- 入力検証: 全エンドポイントでスキーマ検証を行う（SECURITY-05）
- レート制限: ログインエンドポイントにIP単位の簡易レート制限（SECURITY-11, SECURITY-12のブルートフォース対策）
- 依存管理: npm + package-lock.jsonでバージョン固定、`npm audit`で脆弱性ゼロを維持（SECURITY-10）
- エラーハンドリング: 本番エラーレスポンスはスタックトレース等を含まない汎用メッセージ（SECURITY-09, SECURITY-15）

## 信頼性
- 外部呼び出し（Upstash Redisへのアクセス）は全てtry/catchで処理し、失敗時は汎用エラーレスポンスを返す（SECURITY-15）
- グローバルエラーハンドラを設け、未処理例外でプロセスがクラッシュしないようにする

## 保守性・テスト容易性
- TypeScriptによる型安全性
- Property-Based Testing拡張（Partial: PBT-02, 03, 07, 08, 09を強制）に対応したテストフレームワークを採用する（tech-stack-decisions.md参照）
- Functional DesignのPBT-01 Property一覧をテストコードに反映する
