# Business Logic Model: Frontend Web App

技術非依存（フレームワーク/ライブラリ非依存）のロジックを記述する。具体的な実装技術はNFR Requirements/NFR Designで決定する。

## 1. 入力検出・検証ロジック（AudioInputManager）
1. 入力が`File`オブジェクトかURL文字列かを判定する
2. `File`の場合: 拡張子/MIMEタイプがmp3/wav/m4aか、サイズが100MB以下かを検証する（business-rules.md）。違反時はエラーを返し処理を中断する
3. URL文字列の場合: youtube.com/watch または youtu.be形式かを検証する。違反時はエラーを返し処理を中断する
4. 検証成功後、2のSongKey生成ロジックに進む

## 2. SongKey生成ロジック
- **ローカルファイル**: ファイル内容のハッシュ値（例: SHA-256）を`songKey`とする。同一ファイルは常に同一`songKey`になる（決定性）
- **YouTube**: URLから動画ID部分のみを抽出し、`"yt:" + videoId`の形式に正規化する。クエリパラメータの違い（再生リスト等の付加情報）があっても同じ動画IDなら同じ`songKey`になる

## 3. PlaybackCapabilities判定ロジック
- `sourceType === "local"` → `{ supportsEQ: true, supportsPitchDisplay: true, supportsWaveform: true, supportsSpeedChange: true, loopPrecision: "sample" }`
- `sourceType === "youtube"` → `{ supportsEQ: false, supportsPitchDisplay: false, supportsWaveform: false, supportsSpeedChange: true, loopPrecision: "approximate" }`

## 4. BassEQProcessorロジック（FR3）
- 入力: UIのgainスライダー値（-12dB〜+12dB）
- 処理: ベース帯域（目安40〜250Hz）を中心としたフィルタのgainパラメータにマッピングする
- gain = 0 のとき、フィルタを無効化（bypass）し、元の信号と同一の出力にする（business-rules.mdの恒等性ルール）

## 5. TimeStretchProcessorロジック（FR4）
- 入力: UIの速度スライダー値（0.25〜1.0、範囲外はクランプ）
- 処理: 再生速度を変更しつつ、基音周波数を一定に保つ（ピッチ保持）
- 出力: 指定速度での再生。どの速度でも、同一音源の基音周波数はほぼ一定に保たれる（許容誤差はNFR Designで定義）

## 6. PitchDetectorロジック（FR6.1）
1. LocalAudioEngineから現在の音声フレームを取得する
2. 基音周波数を推定する
3. 推定周波数が対象帯域（約41Hz〜400Hz）外、または検出信頼度が閾値（0.8）未満の場合 → `PitchResult.detected = false`、`noteName = null`、`frequencyHz = null`
4. 対象帯域内かつ信頼度十分の場合 → 等律（A4=440Hz基準）で最も近い音名にマッピングし、`detected = true`として`noteName`・`frequencyHz`・`confidence`を返す

## 7. LoopEditor検証ロジック（FR5）
1. ユーザーがA点・B点を指定する
2. `0 <= A < B <= duration` かつ `B - A >= 0.5` を検証する
3. 違反時: 設定を拒否し、直前の有効なLoopPointsを維持。UIにエラーを表示する
4. 成功時: 新しいLoopPointsを`PlaybackSource.setLoop(A, B)`に渡す

## 8. SongWorkspace 保存・読込オーケストレーションロジック（FR7, FR8、オフラインファースト）

### 保存時（ユーザーが保存操作を行う、またはメモ/ループ変更確定時）
1. 現在の`SongWorkspaceState`（loopPoints, memo, updatedAt=現在時刻）を**常にローカルストレージへ書き込む**
2. `Session`が存在し、かつオンラインであれば、バックエンドへの同期（SyncClient.saveSongData）を試みる
3. 同期が成功した場合: 完了。失敗した場合（未ログイン、オフライン、通信エラー）: `SyncQueueEntry`に該当`songKey`の最新状態を保持する（既存のキュー項目があれば上書き）

### 読込時（曲を開く）
1. ローカルストレージから該当`songKey`の`SongWorkspaceState`を即座に読み込み、UIに反映する（オフラインでも即時表示可能）
2. `Session`が存在し、オンラインであれば、バックエンドから該当`songKey`のデータを取得する
3. ローカルとバックエンドの両方にデータが存在する場合、`updatedAt`を比較し、新しい方で上書きする（Last-Write-Wins）。バックエンドの方が新しければローカルストレージも更新する

### ログイン時・オンライン復帰時
1. `SyncQueueEntry`に保持されている全エントリを、キューに入れられた順に送信する
2. 各送信について、Last-Write-Winsルールに従いバックエンド側のタイムスタンプと比較して上書き可否を判定する
3. 送信成功したエントリはキューから削除する

## PBT-01: Property Identification（Partial適用: PBT-02, PBT-03, PBT-07, PBT-08, PBT-09を強制）

| コンポーネント/ロジック | 識別されたProperty | カテゴリ |
|---|---|---|
| SongKey生成（ローカル） | 同一ファイル内容に対し、常に同一songKeyを返す（決定性・Idempotence的） | Idempotence |
| SongKey生成（YouTube） | 動画IDが同じなら、クエリパラメータが異なっても同一songKeyを返す | Invariant |
| BassEQProcessor | gain=0のとき出力は入力と恒等（bypass） | Invariant |
| BassEQProcessor | gainの大小関係と低音域強調の強さの大小関係が単調である | Invariant |
| TimeStretchProcessor | 任意の有効なrate（0.25〜1.0）で、検出される基音周波数が元の周波数から許容誤差内に保たれる | Invariant |
| TimeStretchProcessor | rateが範囲外の値は[0.25, 1.0]にクランプされる | Range constraint |
| PitchDetector | 既知の周波数の正弦波テスト信号に対し、期待される音名にマッピングされる | Oracle（等律周波数表との比較） |
| LoopEditor検証 | 検証後、常に `0<=A<B<=duration` かつ `B-A>=0.5` が成立するか、操作が拒否される | Invariant |
| LoopEditor検証 | 同じ無効な入力を2回検証しても、2回とも拒否され状態が変化しない | Idempotence |
| Last-Write-Wins マージ | `merge(local, remote)`で`remote.updatedAt > local.updatedAt`なら常にremoteが採用される | Invariant |
| Last-Write-Wins マージ | 同じ状態を2回マージしても結果は変わらない | Idempotence |

これらのPropertyはCode Generation（Code Generation PlanのPBTテスト項目）に引き継ぐ。
