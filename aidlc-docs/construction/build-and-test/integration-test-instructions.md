# Integration Test Instructions

## Purpose
Unit 1（Frontend）とUnit 2（Backend）を実際に連携させて動作確認する。加えて、自動化ツールでは検証しきれない「実際の音声再生」を手動で確認する手順を示す。

## Test Scenarios

### Scenario 1: ローカル音声ファイルの単体動作確認（バックエンド不要）
- **Description**: Story 1〜6（音源入力、EQ、スロー再生、ループ、音程表示、波形表示）はバックエンドなしで完結する
- **Setup**: `cd frontend && npm run dev`
- **Test Steps**:
  1. ブラウザで `http://localhost:5173` を開く
  2. mp3/wav/m4aファイルをアップロードする
  3. 低音域EQスライダー、再生速度スライダー、ループ設定、音程表示、波形表示をそれぞれ操作する
- **Expected Results**: 各UIが音声に反応する（EQで低音が強調される、速度を落としても音程が変わらない、ループ区間で繰り返し再生される、鳴っている音の音名が表示される）
- **Cleanup**: ブラウザタブを閉じる、`npm run dev`のプロセスを終了する

**自動検証済みの範囲（2026-10-19実施）**: ヘッドレスブラウザで実際にwavファイル（110Hz正弦波、1秒）をアップロードし、PlayerScreen側のコンポーネント（再生ボタン、シークバー、速度/EQスライダー、ループボタン、音程表示「--」、波形切替、メモ欄、保存ボタン）が正しいcapabilities（ローカル＝全機能表示）で描画されることを確認した。

**手動確認が必要な範囲**: サンドボックス環境のヘッドレスChromeは実際のオーディオ出力デバイスを持たないため、「再生」ボタンを押した直後にページがクラッシュ・リロードする現象が発生し、実際の音声再生・EQの効き具合・ピッチ検出結果・ループの耳での確認は自動化できなかった。**通常のブラウザ（音声出力デバイスのあるご自身のPC/スマホ）で上記Test Stepsを実際に試し、音が正しく聞こえるか確認してください。**

### Scenario 2: Backend Sync APIの単体起動確認（ローカル、実際のUpstash接続）
- **Description**: バックエンドが単体で起動し、認証・曲データAPIが応答することを確認する
- **Setup**:
  1. Upstash Redisの無料アカウントを作成し、データベースを1つ作成する
  2. `backend/.env.local`に`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`を設定する
  3. `cd backend && npm run create-account -- you@example.com "a-strong-password"` でアカウントを作成する
  4. `npm run dev` でローカルサーバーを起動する（`http://localhost:8787`）
- **Test Steps**:
  ```bash
  curl http://localhost:8787/health
  # => {"status":"ok"}

  curl -i -X POST http://localhost:8787/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com","password":"a-strong-password"}'
  # => 200、Set-Cookie: sessionId=... が返ること
  ```
- **Expected Results**: ログインが成功し、セッションCookieが発行される
- **Cleanup**: `npm run dev`のプロセスを終了する

**自動検証済みの範囲（2026-10-19実施）**: `/health`が200を返すこと、Upstash Redis未接続の状態でも`/songs/*`への未認証アクセスが正しく401を返すこと（認証ミドルウェアがCookie不在時はRedisに触れず即座に拒否するため）を確認した。実際のUpstash Redis接続・ログイン成功フローは、ご自身のUpstashアカウント作成が必要なため未実施。

### Scenario 3: Frontend ⇔ Backend 連携（曲データの保存・同期）
- **Description**: ログイン後、ローカルファイルを開いてループ/メモを保存し、別タブ（別セッション想定）で復元されることを確認する
- **Setup**: Scenario 1・2の両方を起動し、`frontend/.env.local`の`VITE_BACKEND_API_URL`を`http://localhost:8787`に設定した状態で`npm run dev`
- **Test Steps**:
  1. フロントエンドでログインする
  2. 音声ファイルを開き、A-Bループとメモを設定して「保存」を押す
  3. ページをリロードし、同じファイルを再度開く
  4. ループ区間・メモが復元されることを確認する
  5. （競合テスト）わざと`backend`のRedisに手動で新しい`updatedAt`のレコードを入れた状態で保存し、409が発生してサーバー側データに揃うこと（`SaveStatusIndicator`が「クラウドに同期済み」になり、巻き戻りが起きないこと）を確認する
- **Expected Results**: 保存・復元が正しく行われ、同期ステータスが適切に表示される
- **Cleanup**: 両方のdevサーバーを停止する

この統合シナリオは、Upstash Redisの実アカウントが必要なため、Code Generation時点では未実施。**初回セットアップ完了後に手動で実施してください。**

## まとめ
| シナリオ | 自動検証 | 手動確認が必要 |
|---|---|---|
| 1. ローカル音声の単体動作 | UI描画・capabilities | 実際の音の聞こえ方 |
| 2. Backend単体起動 | ヘルスチェック、未認証401 | Upstashアカウント作成後のログイン成功フロー |
| 3. Frontend⇔Backend連携 | - | 全体（Upstashアカウント作成後） |
