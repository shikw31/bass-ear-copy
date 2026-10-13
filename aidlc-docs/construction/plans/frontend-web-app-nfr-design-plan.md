# NFR Design Plan: Frontend Web App

## 評価結果（質問は設けず、技術的に妥当な方針を直接決定。レビュー時にご確認ください）

### Resilience Patterns
- **方針**: 同期失敗時は指数バックオフ（初回1秒、最大30秒間隔）でリトライし、オンライン/ログイン状態になるたび自動的に再試行する。最大試行回数の上限は設けない（ユーザーデータを失わないことを優先）
- **根拠**: 個人用ツールでデータ損失が最も避けたい失敗モードのため、リトライを打ち切らない方針とする

### Scalability Patterns
- **適用性**: N/A — 単独ユーザーのフロントエンドであり、スケーリング対象ではない

### Performance Patterns
- **方針**: ピッチ検出・波形表示はWeb Audio APIの`AnalyserNode`から`requestAnimationFrame`でポーリングし、10〜20Hz（ピッチ検出）/30fps（波形）に間引いて処理する。AudioWorklet（専用オーディオスレッド）は導入しない
- **根拠**: EQはBiquadFilterNode（ネイティブ、自動的にオーディオスレッドで処理される）のみで実現でき、ピッチ検出・波形表示はUI表示目的で厳密なサンプル精度を要求しないため、実装が簡単なメインスレッドポーリングで十分パフォーマンス要件（遅延50ms以内、間引き後の更新頻度）を満たせる

### Security Patterns
- **方針**: SECURITY-04のHTTPセキュリティヘッダー（CSP, HSTS等）は、具体的な設定場所（静的ホスティング/CDN設定）をInfrastructure Designで確定する。ここでは「全HTMLレスポンスに適用される」という要件のみを再掲する
- **方針**: 依存ライブラリ（pitchy等）はnpm経由で導入し、SRIはCDN経由スクリプトを使わないため対象外（ビルド時にバンドルするため）

### Logical Components
- 以下のコンポーネントをNFR対応のために追加する（Application Designのコンポーネントを拡張）

## Execution Checklist

- [x] Step A: 上記方針に矛盾がないか確認する（矛盾なし）
- [x] Step B: NFR Designパターンを文書化する（nfr-design-patterns.md）
- [x] Step C: 論理コンポーネントを文書化する（logical-components.md）
