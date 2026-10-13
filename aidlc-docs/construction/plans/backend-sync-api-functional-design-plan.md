# Functional Design Plan: Backend Sync API

## Context
- Unit: Backend Sync API (`backend/`)
- 対象ストーリー: Story 7（保存）, 8（ログイン・クラウド同期）のバックエンド側
- Application Designのコンポーネント: AppBackendAPI, AuthService, SongDataService, SongDataStore
- 前提（Unit 1で確定済み）: フロントエンドはオフラインファーストで動作し、保存時にまずローカル保存、ログイン済み・オンライン時のみバックエンドに同期する。認証はhttpOnly/Secure/SameSiteセッションCookieに一任する（SECURITY-12）。フロントエンドのSyncOrchestrationServiceは同期失敗時に指数バックオフでリトライする

## Questions

### Q1: アカウント作成方法
個人用ツール（単独ユーザー、Requirements Analysis Q8で確定）であることを踏まえ、ユーザーアカウントの作成方法をどうしますか？

A) 事前プロビジョニング（推奨） — 公開の新規登録エンドポイントは作らず、環境変数やセットアップスクリプトで本人のアカウント（メール+パスワードハッシュ）を1つだけ作成する。不特定多数からの登録試行という誤用ケース自体をなくせる

B) 通常のサインアップエンドポイントを作る — `/auth/register`等を公開し、誰でも登録できるようにする（将来的に他ユーザーにも使ってもらう可能性がある場合）

C) Other (please describe after [Answer]: tag below)

[Answer]: A（事前プロビジョニング。公開サインアップは作らない）

### Q2: 同時書き込み時の競合処理（重要な設計判断）
フロントエンドは「同じ曲のデータを複数端末（自宅PC・スタジオのスマホ）で編集する可能性がある」前提で、`updatedAt`を見てLast-Write-Winsで競合解決します（Unit 1で実装済み）。バックエンド側の`PUT /songs/{songKey}`で、リクエストの`updatedAt`がサーバー保存済みデータより古い場合、どう扱いますか？

A) サーバー側でもLast-Write-Winsを強制する（推奨） — 古い`updatedAt`のPUTは409で拒否し、現在の最新データを返す。データの巻き戻り（新しい方が古い方で上書きされる）を確実に防げる。**ただし、Unit 1のSyncOrchestrationServiceに小さな修正が必要**（409を受け取ったら、現在のサーバーデータを取得してローカルにマージし、再送キューからその項目を削除する処理を追加する。現状のコードは409も通常の失敗として扱い、絶対に成功しない再送を無限に繰り返してしまう）

B) 常に最後に書き込まれた内容を受け入れる（サーバー側では競合チェックをしない） — 実装は単純だが、オフラインだった古い端末の書き込みが後から届くと、新しいデータを上書きしてしまう可能性がある（データの巻き戻りを防げない）

C) Other (please describe after [Answer]: tag below)

[Answer]: A（サーバーでLWWを強制。409 Conflict + 最新データを返す。Unit 1への追加修正が必要なことを承知の上で選択）

## 事前に決定する業務ルール（レビューしてご確認ください、質問は設けません）
- **パスワードポリシー**: 最小8文字（SECURITY-12準拠、詳細な強度要件は個人用ツールのため最小限とする）
- **セッション有効期限**: 30日間のスライディング有効期限（アクセスごとに延長）。ログアウトで即時無効化
- **ログイン試行制限**: 連続失敗時に段階的な遅延を導入する（ブルートフォース対策、SECURITY-12）
- **曲データの入力検証（サーバー側、SECURITY-05）**: `songKey`の形式検証（`local:`または`yt:`プレフィックス）、メモ最大2000文字、ループ区間`0 <= a < b`かつ`b`が妥当な範囲内（曲の長さはサーバーが知らないため、上限24時間程度の粗いチェックのみ）
- **認可（SECURITY-08）**: 全ての曲データ操作はセッションのuserIdでスコープし、他ユーザーのデータには（将来ユーザーが増えた場合でも）アクセスできないようにする

## Execution Checklist

- [x] Step A: Q1・Q2の回答を分析し、矛盾・曖昧さがないか確認する（両回答とも推奨案、矛盾なし）
- [x] Step B: ビジネスロジックモデルを作成する（business-logic-model.md）
  - [x] 認証ロジック（パスワード検証、セッション発行・検証・失効）
  - [x] 曲データの保存・取得ロジック（ユーザースコープ、Q2回答に基づく競合処理）
  - [x] 入力検証ロジック
- [x] Step C: 業務ルールを文書化する（business-rules.md）
- [x] Step D: ドメインエンティティを定義する（domain-entities.md: User, Session, SongRecord）
- [x] Step E: PBT-01のProperty識別を実施し、business-logic-model.mdに記載する
- [x] Step F（Q2でAを選んだ場合）: Unit 1（Frontend Web App）のSyncOrchestrationServiceに対する修正要否を記録し、ユーザーに実施タイミングを確認する（本ドキュメント末尾に記録。ユーザーに確認予定）
