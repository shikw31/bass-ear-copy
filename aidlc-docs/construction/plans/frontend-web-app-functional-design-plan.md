# Functional Design Plan: Frontend Web App

## Context
- Unit: Frontend Web App (`frontend/`)
- 対象ストーリー: Story 1〜8（Story 7・8はバックエンド連携部分を除くフロントエンド側のロジック）
- Application Designのコンポーネント: AudioInputManager, PlaybackSource, LocalAudioEngine, YouTubePlayerAdapter, BassEQProcessor, TimeStretchProcessor, PitchDetector, WaveformVisualizer, LoopEditor, SongWorkspace, AuthClient, SyncClient, PlaybackOrchestrationService, SyncOrchestrationService

## Questions

### Q1: 保存のオフライン対応
スタジオなどネットワークが不安定な場所での利用シーンがあります。曲ごとのループ/メモの保存は、ログイン・オンライン状態が前提ですか？それともオフラインでもローカルにまず保存し、後でログイン/オンライン時にクラウド同期する形にしますか？

A) オフラインファースト（推奨）: ログイン有無・オンライン有無に関わらず、常にブラウザのローカルストレージにまず保存する。ログイン済みでオンラインなら、保存時またはバックグラウンドでクラウドにも同期する

B) オンライン必須: 保存操作にはログイン＆オンラインが必須。未ログイン/オフライン時は保存操作自体を無効化する

C) Other (please describe after [Answer]: tag below)

[Answer]: A（オフラインファースト）

### Q2: ピッチ検出の対象範囲
音名/周波数のリアルタイム検出（Story 6）は、ベースの音域に絞りますか、それとも汎用的な範囲にしますか？

A) ベース音域に限定する（推奨）: 目安として4弦ベースの開放弦E1（約41Hz）から上の帯域（例: 約41Hz〜400Hz程度）に検出対象を絞り、オクターブ誤検出を減らす

B) 汎用的な範囲にする: ベース以外の楽器にも使える広い周波数範囲（例: 30Hz〜1000Hz超）で検出する

C) Other (please describe after [Answer]: tag below)

[Answer]: A（ベース音域: 約41Hz〜400Hz程度に限定）

## 事前に決定する業務ルール（レビューしてご確認ください、質問は設けません）
- **対応ファイル形式**: mp3, wav, m4a。最大ファイルサイズは100MBとする（ブラウザのメモリ制約を考慮した仮の上限、レビュー時に調整可）
- **YouTube URL検証**: `youtube.com/watch?v=...` または `youtu.be/...` 形式のみ許可
- **低音域EQのgain範囲**: -12dB 〜 +12dB
- **スロー再生の速度範囲**: 0.25x 〜 1.0x（音程保持）。1.0x超（倍速）はFR4の対象外（耳コピ用途のため高速化は不要と判断）
- **ループ区間の制約**: 0 ≤ A < B ≤ 曲の長さ、かつ B - A ≥ 0.5秒（極端に短いループを防ぐ）
- **メモの文字数制限**: 最大2000文字（SECURITY-05入力検証に対応）
- **同期の競合解決**: 同じ曲を複数端末で編集した場合、最後に保存した方（タイムスタンプが新しい方）で上書きする（Last-Write-Wins）。単独ユーザーかつ基本的に順番に使う前提のため、複雑な競合マージは行わない

## Execution Checklist

- [x] Step A: Q1・Q2の回答を分析し、矛盾・曖昧さがないか確認する（両回答とも推奨案、矛盾なし）
- [x] Step B: ビジネスロジックモデルを作成する（business-logic-model.md）
  - [x] 入力検出・検証ロジック（ファイル形式、YouTube URL）
  - [x] SongKey生成ロジック（ファイルハッシュ／URL正規化）
  - [x] BassEQProcessorのフィルタ設計（技術非依存のロジックレベル）
  - [x] TimeStretchProcessorの速度マッピングロジック
  - [x] PitchDetectorの周波数→音名マッピング、検出不能判定
  - [x] LoopEditorの区間検証ロジック
  - [x] SongWorkspaceのローカル保存／クラウド同期のオーケストレーションロジック（Q1回答を反映）
  - [x] PlaybackCapabilities判定ロジック（Local/YouTubeで異なる機能可否）
- [x] Step C: 業務ルールを文書化する（business-rules.md）
- [x] Step D: ドメインエンティティを定義する（domain-entities.md）
- [x] Step E: フロントエンドコンポーネント構成を定義する（frontend-components.md）
  - [x] コンポーネント階層
  - [x] 各コンポーネントのprops/state
  - [x] ユーザー操作フロー
  - [x] フォーム検証ルール
  - [x] バックエンドAPI連携ポイント
- [x] Step F: PBT拡張（Partial）のProperty識別を実施し、business-logic-model.mdに記載する（PBT-01）
  - [x] SongKey生成のラウンドトリップ性、EQ/タイムストレッチ計算の不変条件等を識別
