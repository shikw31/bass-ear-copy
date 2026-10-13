# NFR Requirements: Frontend Web App

## パフォーマンス
- EQ/タイムストレッチの処理遅延: 知覚できないレベル（目安50ms以内）でUIスライダー操作に追従する
- ピッチ検出の更新頻度: 10〜20Hz程度（音声フレーム全てではなく、UI表示に十分な頻度に間引く）
- 波形/スペクトログラム描画: 30fps程度で十分
- 初期ロード（ページ表示〜操作可能になるまで）: 目安3秒以内（モバイル回線でも実用的な速さ）

## 可用性・スケーラビリティ
- 個人用ツールのため、可用性SLA・水平スケーリング要件は設定しない（Resiliency Baseline拡張は無効化済み、`aidlc-docs/aidlc-state.md`のExtension Configuration参照）
- オフラインファースト設計（Functional Design済み）により、バックエンドが一時的に利用不可でもローカル機能（再生・EQ・ループ・音程表示等）は継続して使える

## セキュリティ（Security Baseline拡張、SECURITY-12準拠）
- 認証状態はバックエンドが発行するhttpOnly・Secure・SameSite属性付きセッションCookieで管理し、フロントエンドのJavaScriptから直接トークンにアクセスしない（XSSによるトークン窃取対策）
- フォーム入力（ファイル形式、YouTube URL、メモ文字数）は、Functional Designで定義した業務ルールに従いクライアント側で事前検証する（ただしサーバー側の検証を代替するものではない。SECURITY-05はバックエンド側でも別途適用）
- 依存ライブラリ（React, pitchy等）はpackage-lock.json等でバージョン固定する（SECURITY-10）

## 信頼性
- ローカル再生中に音声デコードや処理でエラーが発生した場合、エラーメッセージを表示し、アプリ全体をクラッシュさせない（グローバルエラーハンドラ、SECURITY-15準拠）
- バックエンドとの通信エラー（同期失敗）はSyncQueueEntryに保持し、自動リトライする（Functional Design済み）。ユーザーへは状態を明示する（SaveStatusIndicator）

## 保守性・テスト容易性
- TypeScriptによる型安全性を活用し、音声処理ロジック（数値パラメータの多い領域）のバグを予防する
- Property-Based Testing拡張（Partial: PBT-02, 03, 07, 08, 09を強制）に対応したテストフレームワークを採用する（tech-stack-decisions.md参照）
- Functional Designで識別したPBT-01のProperty一覧をテストコードに反映する

## ユーザビリティ
- モバイル（タッチ操作）とPC（マウス/キーボード）の両方に適したレスポンシブUI
- スタジオ等の短時間利用でも、曲を開いてからループ設定までの操作が最小限であること（Requirements Analysis NFR3準拠）
