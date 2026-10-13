# Business Logic Model: Backend Sync API

技術非依存のロジックを記述する。具体的な実装技術（言語/フレームワーク/DB）はNFR Requirementsで決定する。

## 1. ログイン
1. `email`でUserを検索。見つからない場合は「メールアドレスまたはパスワードが正しくありません」という汎用エラーを返す（ユーザー列挙を防ぐ、SECURITY-09）
2. パスワードハッシュを検証。不一致の場合は同じ汎用エラーを返し、失敗回数を記録する
3. 連続失敗が閾値を超えた場合、段階的な遅延を導入する（ブルートフォース対策）
4. 成功時: 新しいSessionを発行（`sessionId`はランダムかつ推測不可能な値、`expiresAt = now + 30日`）。SessionをCookieとしてクライアントに返す（httpOnly/Secure/SameSite）

## 2. セッション検証（全ての`/songs/*`リクエストで実行）
1. Cookieから`sessionId`を取り出す
2. Sessionを検索。存在しない、または`expiresAt`を過ぎている場合は401を返す（deny-by-default、SECURITY-08）
3. 有効な場合、`expiresAt`を`now + 30日`に更新する（スライディング延長）
4. `Session.userId`を以降の処理に渡す

## 3. ログアウト
1. Cookieから`sessionId`を取り出し、該当Sessionレコードを削除する
2. Cookieの無効化をクライアントに指示する

## 4. 曲データの取得（`GET /songs/{songKey}`）
1. セッション検証（手順2）でuserIdを取得
2. `(userId, songKey)`でSongRecordを検索
3. 見つからない場合は404を返す

## 5. 曲データの保存（`PUT /songs/{songKey}`、Q2回答: サーバーでLWW強制）
1. セッション検証（手順2）でuserIdを取得
2. リクエストボディを検証する（business-rules.md: songKey形式、メモ長、ループ区間の粗い範囲）。違反時は400を返す
3. `(userId, songKey)`で既存のSongRecordを検索
4. 既存レコードが存在し、かつ`existing.updatedAt > incoming.updatedAt`の場合:
   - 409 Conflictを返し、レスポンスボディに`existing`（サーバー側の最新データ）を含める
   - レコードは更新しない
5. それ以外の場合（既存レコードがない、またはincomingが既存と同じかそれより新しい）:
   - `(userId, songKey)`のレコードをincomingの内容で作成/更新する
   - 200（または204）を返す

## 6. フロントエンド（Unit 1）への影響に関する注記
手順5のLWW強制により、**Unit 1のSyncOrchestrationServiceは409レスポンスを正しく処理する修正が必要**になる。現状のUnit 1コード（`saveSongData`呼び出しの`catch`ブロック）は、409を他の通信エラーと区別せず再送キューに入れてしまうため、「サーバーの方が新しい」という状況ではその項目が永久に成功しない無限リトライになる。

**必要な修正内容**（Unit 2のCode Generation、またはそれに続くUnit 1への追加修正として実施）:
- `saveSongData`が409を受け取った場合、レスポンスボディの`existing`データを使ってローカルの`mergeLastWriteWins`を適用し、ローカルストレージを更新する
- 該当`songKey`の再送キュー項目を削除する（これ以上再送しても成功しないため）

この対応をいつ実施するか（Unit 2のCode Generation内で先行してUnit 1に手を入れるか、Unit 2完了後に別途対応するか）は、Functional Design完了後のレビューでご確認いただく。

## PBT-01: Property Identification（Partial適用: PBT-02, 03, 07, 08, 09を強制）

| ロジック | 識別されたProperty | カテゴリ |
|---|---|---|
| ログイン（パスワード検証） | `verify(hash(password), password)`は常にtrue。`verify(hash(password), 別のpassword)`は常にfalse | Round-trip的（ハッシュ検証の往復） |
| セッション検証 | `expiresAt`を過ぎたSessionに対する検証は、どれだけ時間が経過していても常にfalse（401） | Invariant |
| セッション検証 | 有効なセッションに対する検証を2回連続で行っても、2回目も成功する（スライディング延長は何度行っても検証結果自体は変わらない） | Idempotence |
| 曲データ保存（LWW） | `incoming.updatedAt < existing.updatedAt`の場合、常に409（書き込みは反映されない） | Invariant |
| 曲データ保存（LWW） | `incoming.updatedAt >= existing.updatedAt`の場合、常に書き込みが成功し、保存後の値は`incoming`と一致する | Invariant |
| 曲データ保存（LWW） | 同一の`incoming`を2回PUTしても、2回目も成功し結果は変わらない（冪等） | Idempotence |
| 入力検証（songKey/メモ/ループ） | 検証後、常にbusiness-rules.mdの制約が成立するか、操作が拒否される | Invariant |
