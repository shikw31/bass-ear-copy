# User Stories: 耳コピ補助アプリ

対象ペルソナ: [ベース奏者（本人）](./personas.md#ペルソナ1-ベース奏者本人)（全ストーリー共通・単独ユーザー）

---

## Story 1: Webアプリへのアクセス（FR1）

**As a** ベース奏者
**I want** PCとスマホどちらのブラウザからもこのアプリにアクセスしたい
**So that** 自宅での準備とスタジオでの練習、両方の場面で同じアプリを使える

### Acceptance Criteria
- Given: PCの主要ブラウザ（Chrome/Safari/Firefox/Edge）でアプリのURLを開く
  When: ページを読み込む
  Then: アプリが正常に表示され、操作できる

- Given: スマホの主要ブラウザで同じURLを開く
  When: ページを読み込む
  Then: タッチ操作に適したレイアウトでアプリが表示され、操作できる

### INVEST Check
Independent/Negotiable/Valuable/Estimable/Small/Testable — 単純な表示確認のため全項目満たす。

---

## Story 2: 音源入力（ローカルファイル／YouTube）（FR2）

**As a** ベース奏者
**I want** 手持ちの音声ファイルをアップロードするか、YouTubeのURLを指定するかを選んで曲を読み込みたい
**So that** 持っている音源とYouTube上の音源の両方で耳コピの練習を始められる

### Acceptance Criteria

**ローカルファイルパターン**
- Given: アプリを開いている
  When: mp3/wav/m4aファイルをアップロードする
  Then: 音源が読み込まれ、再生・EQ・スロー再生・精密ループ・音程表示・波形表示（Story 3〜6）が利用可能になる

- Given: 非対応の形式のファイルをアップロードしようとする
  When: アップロードを実行する
  Then: 対応形式ではないことを示すエラーメッセージが表示され、処理は行われない

**YouTubeパターン**
- Given: アプリを開いている
  When: YouTube動画のURLを入力する
  Then: 動画が埋め込みプレーヤーで再生可能になり、再生速度変更と簡易A-Bループ（Story 5参照）が利用可能になる。EQ・音程表示・波形表示（Story 3, 6）はYouTube経路では提供されない旨が表示される

- Given: 無効なURL（YouTube以外、または存在しない動画）を入力する
  When: 読み込みを実行する
  Then: URLが無効であることを示すエラーメッセージが表示される

### INVEST Check
Independent（他ストーリーの前提になるが本ストーリー自体は入力受付のみで完結）/Negotiable/Valuable/Estimable/Small（2つの入力経路だが受け入れ基準レベルで小さく保てる）/Testable。

---

## Story 3: 低音域強調EQ（FR3）※ローカルファイルのみ

**As a** ベース奏者
**I want** 再生中の音の低音域（ベースの帯域）を強調したい
**So that** 他の楽器に埋もれているベースの音をはっきり聞き取れる

### Acceptance Criteria
- Given: ローカル音声ファイルを読み込んで再生している
  When: 低音域EQのgainスライダーを上げる
  Then: 再生される音の低音域（目安40〜250Hz、調整可能）が強調されて聞こえる

- Given: EQのgainが0（オフ）の状態
  When: 再生する
  Then: EQをかけていない元の音と同じに聞こえる

- Given: 再生中にgainをリアルタイムに変更する
  When: スライダーを操作する
  Then: 再生を止めずに即座にEQの効き具合が変化する

### INVEST Check
Independent/Negotiable/Valuable（本アプリのMVP最優先機能）/Estimable/Small/Testable（音量測定やスペクトル比較で検証可能）。

---

## Story 4: スロー再生（FR4）※ローカルファイルのみ

**As a** ベース奏者
**I want** 音程を変えずに再生速度を落としたい
**So that** 速いフレーズも音程を保ったまま正確に聞き取れる

### Acceptance Criteria
- Given: ローカル音声ファイルを読み込んで再生している
  When: 再生速度を100%未満（例: 50%）に設定する
  Then: 再生速度は遅くなるが、音の高さ（ピッチ）は変化しない

- Given: 再生速度を100%に戻す
  When: 再生する
  Then: 元の速度・ピッチで再生される

### INVEST Check
Independent/Negotiable/Valuable/Estimable/Small/Testable（基音周波数を測定し、速度を変えてもピッチが一定であることを確認できる）。

---

## Story 5: A-Bループ再生（FR5）

**As a** ベース奏者
**I want** 聞き取りたい区間を指定して繰り返し再生したい
**So that** 同じフレーズを何度も聞き直して耳コピの精度を上げられる

### Acceptance Criteria

**ローカルファイル（精密ループ）パターン**
- Given: ローカル音声ファイルを読み込んで再生している
  When: A点とB点をサンプル精度で指定し、ループ再生を開始する
  Then: B点に到達した瞬間にA点へ途切れなく戻り、繰り返し再生される

**YouTube（簡易ループ）パターン**
- Given: YouTube動画を埋め込みで再生している
  When: A点とB点を指定し、ループ再生を開始する
  Then: B点付近に到達後、数百ミリ秒程度の誤差を許容してA点付近にシークし、繰り返し再生される（サンプル精度は保証しない）

### INVEST Check
Independent/Negotiable/Valuable/Estimable/Small/Testable（ローカルはループ境界のサンプル位置を検証、YouTubeはシーク誤差が許容範囲内かを検証）。

---

## Story 6: 音程・波形の可視化（FR6）※ローカルファイルのみ

**As a** ベース奏者
**I want** 鳴っている音の音名や周波数、波形・スペクトログラムを見たい
**So that** 耳だけでなく目でも音の高さや変化を確認し、耳コピの精度を上げられる

### Acceptance Criteria
- Given: ローカル音声ファイルを再生している
  When: 単一の音（基音がはっきりしている箇所）が鳴っている
  Then: リアルタイムに検出された音名（例: E2）と周波数（Hz）が画面に表示される

- Given: ローカル音声ファイルを再生している
  When: 再生中である
  Then: 波形またはスペクトログラムが再生位置に合わせて視覚的に表示される

- Given: 複数の音が同時に鳴っている、または無音区間である
  When: 音程検出を行う
  Then: 検出不能であることが分かる表示（例: 「--」や薄い表示）になり、誤った音名を表示しない

### INVEST Check
Independent/Negotiable/Valuable/Estimable/Small（音名表示と波形表示で2機能だが密接に関連するため1ストーリーにまとめた）/Testable。

---

## Story 7: 曲ごとのデータ保存（FR7）

**As a** ベース奏者
**I want** 曲ごとにループ区間とメモ（TAB/運指メモ等）を保存したい
**So that** 次回同じ曲を練習するときに、設定し直す手間なく続けられる

### Acceptance Criteria
- Given: ローカルファイルまたはYouTube URLで曲を読み込み、A/Bループ区間を設定している
  When: 保存操作を行う
  Then: その曲（ファイル名・ファイルのハッシュ、またはYouTube URLをキーとする）に対してループ区間が保存される

- Given: メモ入力欄にTAB/運指メモ等のテキストを入力している
  When: 保存操作を行う
  Then: そのメモが曲に紐づいて保存される

- Given: 以前保存した曲を再度開く
  When: 曲（同じファイルまたは同じYouTube URL）を読み込む
  Then: 保存されていたループ区間とメモが自動的に復元される

### INVEST Check
Independent/Negotiable/Valuable/Estimable/Small/Testable。

---

## Story 8: ログイン・クラウド同期（FR8）

**As a** ベース奏者
**I want** ログインして、保存したループ区間やメモを自分の複数の端末で同期したい
**So that** 自宅PCで準備した内容を、スタジオのスマホでもそのまま使える

### Acceptance Criteria
- Given: 未ログイン状態である
  When: ログインを行う（本人確認ができる認証方式）
  Then: 自分のアカウントに紐づいた状態になり、以降の保存（Story 7）がこのアカウントに紐づく

- Given: 自宅PCでログインし、曲のループ区間/メモを保存した
  When: 別のスマホで同じアカウントにログインし、同じ曲を開く
  Then: 自宅PCで保存したループ区間とメモが読み込まれる

- Given: ログアウトする
  When: 別のユーザーが同じ端末でアプリを開く
  Then: 前のユーザーの保存データは表示されない（アカウントに紐づいてアクセス制御されている）

### INVEST Check
Independent/Negotiable/Valuable/Estimable/Small/Testable。Security Baseline拡張（SECURITY-08: 他ユーザーのデータにアクセスできないこと、SECURITY-12: 認証・セッション管理）の受け入れ基準をここに反映している。

---

## ペルソナ・マッピング

| Story | 関連FR | 対象ペルソナ |
|---|---|---|
| 1. Webアプリへのアクセス | FR1 | ベース奏者（本人） |
| 2. 音源入力（ローカル/YouTube） | FR2 | ベース奏者（本人） |
| 3. 低音域強調EQ | FR3 | ベース奏者（本人） |
| 4. スロー再生 | FR4 | ベース奏者（本人） |
| 5. A-Bループ再生 | FR5 | ベース奏者（本人） |
| 6. 音程・波形の可視化 | FR6 | ベース奏者（本人） |
| 7. 曲ごとのデータ保存 | FR7 | ベース奏者（本人） |
| 8. ログイン・クラウド同期 | FR8 | ベース奏者（本人） |

単独ユーザーのため、全ストーリーが同一ペルソナに対応する。
