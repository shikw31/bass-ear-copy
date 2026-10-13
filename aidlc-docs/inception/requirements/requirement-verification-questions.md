# 要件確認質問（耳コピ補助アプリ）

以下の質問に、各設問の `[Answer]:` の後に選択したアルファベットを記入してください。該当する選択肢がない場合は「Other」を選び、`[Answer]:` の後に内容を記述してください。すべて回答が終わったら「done」等とお知らせください。

## Question 1: 利用プラットフォーム
どの環境で動かしたいですか？

A) Webアプリ（ブラウザで動作、PC/スマホどちらからもアクセス可能）

B) スマホ用ネイティブアプリ（iOS/Android）

C) PC用デスクトップアプリ（Mac/Windows）

D) まずWebアプリとして試してみて、必要なら後でネイティブ化を検討

E) Other (please describe after [Answer]: tag below)

[Answer]: A（Webアプリ）

## Question 2: 音源の入力方法
練習したい曲の音源をどう入力したいですか？

**制約についての補足**: YouTube/Spotifyは公式埋め込み/SDK経由なら再生制御（再生・停止・シーク）は可能だが、生の音声波形データへのアクセスは規約上不可。YouTubeは標準プレーヤーに音程保持の速度変更機能があるため再生速度変更＋簡易ループは実現可能。Spotifyは速度変更機能自体が存在しない。音声処理系（精密ループ、EQ、音程表示、波形表示）はローカル音声ファイル入力でのみ実現可能。YouTube/Spotifyからの音声抽出・保存は規約違反のため実装しない。

A) 手持ちの音声ファイル（mp3/wav/m4a等）をアップロードして使う

B) YouTubeなどの動画/音楽サービスのURLを指定して使う（※著作権・利用規約上の制約について別途ご案内します）

C) スマホ/PCのマイクでその場の音源を録音して使う

D) 上記のうち複数を組み合わせたい（具体的な組み合わせをOtherに記載してください）

E) Other (please describe after [Answer]: tag below)

[Answer]: D（ハイブリッド型 — YouTube埋め込みで手軽な速度変更＋簡易ループ、かつ手持ち音声ファイル入力で本格的な音程表示/EQ/精密ループにも対応）

## Question 3: 最重要機能（MVP機能）
最低限、まず欲しい機能はどれですか？

A) スロー再生（音程を変えずに再生速度だけ落とす）

B) 特定区間のループ再生（A-Bリピート）

C) 低音域（ベースの帯域）を強調するEQ/フィルタ

D) 上記すべて（A+B+C）を含めたい

E) Other (please describe after [Answer]: tag below)

[Answer]: C（低音域強調EQを最優先。スロー再生・ループも後続で対応予定）

## Question 4: 音程表示・視覚的な耳コピ支援
音を視覚的・数値的に確認できる機能も欲しいですか？

A) リアルタイムで鳴っている音の音名/周波数を表示する（簡易チューナー的な機能）

B) 波形やスペクトログラムを表示して音の変化を視覚的に確認できるようにする

C) 上記両方欲しい

D) 特に不要、再生速度やループ機能だけで十分

E) Other (please describe after [Answer]: tag below)

[Answer]: C（音名/周波数表示と波形/スペクトログラム表示の両方欲しい）

## Question 5: 練習内容の保存
曲ごとの作業内容を保存したいですか？

A) 曲ごとにループ区間やメモ（TAB/運指メモ等）を保存・再利用したい

B) 保存機能は不要、その場で使い捨てでよい

C) Other (please describe after [Answer]: tag below)

[Answer]: A（保存したい）

## Question 6: 利用シーン
主にどんな場面で使う想定ですか？

A) 自宅のPCでじっくり準備する

B) 練習スタジオやバンド練習の場でスマホでサッと使う

C) 両方想定している

D) Other (please describe after [Answer]: tag below)

[Answer]: C（両方想定。PC/スマホどちらでも使えるWebアプリであることと整合）

## Question 7: データの保存先・オフライン対応
データ（ファイルやメモ）の保存先はどうしたいですか？

A) ローカル（ブラウザ/端末内）に保存されれば十分。クラウド同期は不要

B) 複数端末（自宅PCとスタジオのスマホ等）で使うため、クラウド同期が欲しい

C) Other (please describe after [Answer]: tag below)

[Answer]: B（クラウド同期が必要。PC/スマホ両方で使う前提のため矛盾を解消）

**矛盾検出と解消の記録**: 初回回答は「ローカルのみ」だったが、Question 6「両方の場面で使う」と矛盾するため確認したところ、クラウド同期が必要と判明。

## Question 8: 利用者の範囲
このアプリは誰が使う想定ですか？

A) 自分一人だけが使う個人用ツール

B) バンドメンバーとも共有して、各自が使えるようにしたい

C) Other (please describe after [Answer]: tag below)

[Answer]: A（個人用ツール。クラウド同期は自分の端末間のみで、他人のデータ分離等の多人数対応は不要）

## Question 9: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A（Yes。クラウド同期・ログインがあるため適用）

## Question 10: Resiliency Extensions
Should the resiliency baseline be applied to this project?

**What this extension is.** Enabling it applies a set of directional, design-time best practices for building resilient systems (AWS Well-Architected Framework Reliability Pillar).

**What this extension is NOT.** It does not make the workload production-ready nor guarantee any availability target.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and personal/experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B（No。個人用ツールのため不要）

## Question 11: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: B（Partial。音声処理の純関数部分（ピッチ検出・EQ計算等）のみPBTを適用）
