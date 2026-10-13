# Frontend Components: Frontend Web App

## コンポーネント階層

```
App
├── AuthBar
├── InputScreen        (曲が未読込のとき表示)
└── PlayerScreen        (曲が読込済みのとき表示)
    ├── TransportControls
    ├── SpeedControl
    ├── EQControl              (capabilities.supportsEQ===trueのみ表示)
    ├── LoopControls
    ├── PitchDisplay           (capabilities.supportsPitchDisplay===trueのみ表示)
    ├── WaveformCanvas         (capabilities.supportsWaveform===trueのみ表示)
    ├── MemoEditor
    └── SaveStatusIndicator
└── ErrorToast
```

## 各コンポーネントの概要

### AuthBar
- **State**: `session: Session | null`
- **操作**: ログイン／ログアウトボタン
- **API連携**: AuthClient.login(), AuthClient.logout()

### InputScreen
- **State**: `inputError: string | null`
- **Props**: なし
- **操作**: ファイル選択（input type=file）、YouTube URL入力欄、「読み込む」ボタン
- **検証**: business-rules.mdの入力検証ルールをクライアント側で事前チェックし、違反時は`inputError`を表示
- **遷移**: 読込成功時、PlaybackOrchestrationService.openInput()を呼び、PlayerScreenへ遷移

### PlayerScreen
- **Props**: `workspace: SongWorkspace`
- **State**: `capabilities: PlaybackCapabilities`（workspaceから取得）
- 子コンポーネントへcapabilitiesとworkspaceを配布する

### TransportControls
- **Props**: `playbackSource: PlaybackSource`
- **State**: `isPlaying: boolean`, `currentTime: number`
- **操作**: 再生/一時停止ボタン、シークバー

### SpeedControl
- **Props**: `playbackSource: PlaybackSource`, `capabilities: PlaybackCapabilities`
- **State**: `rate: number`（0.25〜1.0）
- **操作**: スライダー。Local時はTimeStretchProcessor.setRate()、YouTube時はYouTubePlayerAdapter.setPlaybackRate()を呼ぶ（UIは共通、内部実装はPlaybackSourceが吸収）

### EQControl
- **Props**: `eqProcessor: BassEQProcessor`
- **State**: `gainDb: number`（-12〜+12）
- **操作**: スライダー。変更時にBassEQProcessor.setGainDb()をリアルタイムに呼ぶ

### LoopControls
- **Props**: `loopEditor: LoopEditor`, `capabilities: PlaybackCapabilities`
- **State**: `loopPoints: { a: number, b: number } | null`, `validationError: string | null`
- **操作**: 「A点設定」「B点設定」ボタン（現在再生位置を使用）、ループON/OFFトグル
- **検証**: business-rules.mdのループ制約をクライアント側でチェックし、違反時は`validationError`を表示して状態を変更しない
- **表示**: `capabilities.loopPrecision`が"approximate"の場合、簡易ループである旨を表示

### PitchDisplay
- **Props**: `pitchDetector: PitchDetector`
- **State**: `currentPitch: PitchResult`
- **表示**: `detected===true`なら音名+Hz、falseなら"--"

### WaveformCanvas
- **Props**: `waveformVisualizer: WaveformVisualizer`
- **State**: `mode: "waveform" | "spectrogram"`
- **操作**: 表示モード切り替えボタン

### MemoEditor
- **Props**: `workspace: SongWorkspace`
- **State**: `text: string`（最大2000文字）, `charCount: number`
- **検証**: 2000文字を超える入力は拒否（business-rules.md）
- **保存トリガー**: フォーカスアウト時、または明示的な保存操作時にSyncOrchestrationService.save()を呼ぶ

### SaveStatusIndicator
- **Props**: `syncStatus: "saved-locally" | "synced" | "sync-pending" | "sync-failed"`
- **表示**: 現在の保存/同期状態をユーザーに明示する（オフラインファーストの透明性確保）

### ErrorToast
- **State**: `message: string | null`
- **表示**: 入力検証エラー、同期エラー等を一時的に表示する

## 主要なユーザー操作フロー

1. **ローカルファイルを開く**: InputScreenでファイル選択 → 検証 → AudioInputManager.loadLocalFile() → PlaybackOrchestrationService.openInput()がLocalAudioEngine+全プロセッサを接続 → SongWorkspace生成 → SyncOrchestrationService.loadForCurrentUser()でローカル/リモートの保存済みデータを復元 → PlayerScreen表示（全機能有効）

2. **YouTube URLを開く**: InputScreenでURL入力 → 検証 → AudioInputManager.loadYouTubeUrl() → PlaybackOrchestrationService.openInput()がYouTubePlayerAdapter+LoopEditorのみ接続 → SongWorkspace生成 → 同上の復元処理 → PlayerScreen表示（EQ/音程/波形は非表示）

3. **EQ調整**: EQControlのスライダー操作 → BassEQProcessor.setGainDb()をリアルタイム呼び出し → 再生を止めずに反映

4. **ループ設定**: LoopControlsでA/B点設定 → LoopEditor検証 → 成功時PlaybackSource.setLoop()、失敗時エラー表示・状態維持

5. **メモ編集・保存**: MemoEditorで入力 → フォーカスアウトでSongWorkspace.setMemoText() → SyncOrchestrationService.save()（ローカル保存は常時、クラウド同期はログイン・オンライン時のみ）→ SaveStatusIndicator更新

6. **ログイン**: AuthBarでログイン → AuthClient.login() → 成功時、SyncOrchestrationServiceがSyncQueueEntryの未送信データをまとめてバックエンドに送信

7. **再度同じ曲を開く**: 同一ファイル/同一YouTube URLでSongKeyが一致 → SongWorkspace復元フロー（フロー1/2内の復元処理）によりループ区間・メモが自動的に反映される

## バックエンドAPI連携ポイント
- `AuthClient` → `POST /auth/login`, `POST /auth/logout`（AppBackendAPI経由でAuthServiceへ）
- `SyncClient` → `GET /songs/{songKey}`, `PUT /songs/{songKey}`（AppBackendAPI経由でSongDataServiceへ、トークンをAuthorizationヘッダで送信）

具体的なHTTPペイロード形式・エラーコードはNFR Requirements/NFR Designで確定する。
