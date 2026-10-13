# Tech Stack Decisions: Frontend Web App

| 項目 | 決定 | 根拠 |
|---|---|---|
| フレームワーク | React (TypeScript) | 情報量・AI活用時のサンプルコードの多さを重視（ユーザー選択） |
| 言語 | TypeScript | 音声処理の数値パラメータ（dB, rate, Hz, 秒数）の型安全性によりバグを予防（ユーザー選択） |
| ビルドツール | Vite | Reactテンプレートが標準提供され、セットアップが数分で完了 |
| 音声処理基盤 | Web Audio API（ブラウザ標準） | LocalAudioEngine, BassEQProcessor, TimeStretchProcessor, PitchDetector, WaveformVisualizerの実装基盤。追加ライブラリ不要 |
| タイムストレッチ | HTMLAudioElement / MediaElementAudioSourceNodeの`preservesPitch`機能（ブラウザネイティブ） | 独自のタイムストレッチ（フェーズボコーダ等）をゼロから実装する必要がなく、主要ブラウザ（Chrome/Safari/Firefox/Edge）でサポートされている |
| ピッチ検出ライブラリ | pitchy（McLeod Pitch Method実装） | オクターブエラー対策済みの検証されたアルゴリズムを利用し、実装時間を節約（ユーザー選択） |
| YouTube再生 | YouTube IFrame Player API（公式埋め込み） | Application Designで決定済み。追加ライブラリ不要 |
| ローカル永続化 | localStorage（JSON文字列化） | loopPoints/memoのデータサイズが小さく、IndexedDBの複雑さは不要 |
| 認証状態管理 | バックエンド発行のhttpOnly/Secure/SameSiteセッションCookie | SECURITY-12準拠。フロントエンドJSからトークンに直接アクセスさせない |
| テストランナー | Vitest | Viteと統合しやすく、Jest同等機能を持つ |
| Property-Based Testingフレームワーク（PBT-09） | fast-check | Vitestと統合可能。PBT拡張（Partial: PBT-02, 03, 07, 08, 09強制）の推奨フレームワーク表に準拠 |
| 依存管理 | npm + package-lock.json | バージョン固定（SECURITY-10） |

## PBT-09 Compliance
- フレームワーク: fast-check（JavaScript/TypeScript向け、カスタムジェネレータ・自動シュリンク・シード再現性をサポート）
- 統合先: Vitestのテストスイート内でfast-checkのプロパティテストを実行する
- 対象: Functional Designで識別したProperty（SongKey生成、EQ恒等性/単調性、TimeStretchのピッチ保持、PitchDetectorのOracle比較、LoopEditor検証の不変条件/冪等性、Last-Write-Wins マージ）
