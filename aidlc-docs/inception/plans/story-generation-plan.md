# Story Generation Plan（耳コピ補助アプリ）

## Breakdown Approach
Feature-Based（FR1〜FR8の機能単位でストーリーを作成し、各ストーリー内でローカルファイル/YouTube経路の分岐がある場合は明記する）を基本採用。理由: 単独ユーザー・単一ペルソナのため、Persona-BasedやEpic階層化の価値が薄く、Journey-Basedよりも機能単位が実装・レビューと対応付けやすい。

## Questions（チャットで回答いただきました。記録として転記）

### Q1: ペルソナについて
A) 本人（ベース奏者、個人利用、時間制約あり）のみを単一ペルソナとして定義する

[Answer]: A

### Q2: 受け入れ基準のフォーマット
A) Given/When/Then形式

[Answer]: A

### Q3: ストーリーの粒度
A) 機能単位（FR1〜FR8相当）で1〜数ストーリーずつ、処理経路（ローカル/YouTube）の違いはストーリー内の受け入れ基準で明記

[Answer]: A

## Execution Checklist

- [x] Step A: 単一ペルソナ「ベース奏者（本人）」を定義する
- [x] Step B: FR1(プラットフォーム)〜FR8(クラウド同期/認証)を機能単位でストーリー化する
  - [x] FR2関連: ローカルファイル入力ストーリー
  - [x] FR2関連: YouTube埋め込み入力ストーリー
  - [x] FR3: 低音域強調EQストーリー
  - [x] FR4: スロー再生ストーリー
  - [x] FR5: A-Bループストーリー（ローカル精密/YouTube簡易の両方を受け入れ基準で区別）
  - [x] FR6: 音程表示・波形/スペクトログラム表示ストーリー
  - [x] FR7: 曲ごとのループ/メモ保存ストーリー
  - [x] FR8: ログイン・クラウド同期ストーリー
- [x] Step C: 各ストーリーにGiven/When/Then形式の受け入れ基準を記述する
- [x] Step D: 各ストーリーがINVEST基準を満たすか検証する
- [x] Step E: ペルソナとストーリーのマッピング表を作成する
- [x] Step F: stories.md を生成する
- [x] Step G: personas.md を生成する
