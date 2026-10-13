# Component Methods: 耳コピ補助アプリ

**注記**: ここではメソッドシグネチャと概要レベルの目的のみを定義する。詳細な業務ルール（例: ピッチ検出アルゴリズムの具体的な閾値、EQのQ値等）はCONSTRUCTION フェーズのFunctional Designで定義する。

## AudioInputManager
- `detectInputType(input: File | string): "local" | "youtube" | "invalid"` — 入力の種別を判定する
- `loadLocalFile(file: File): Promise<PlaybackSource>` — ローカルファイルから`LocalAudioEngine`を生成する
- `loadYouTubeUrl(url: string): Promise<PlaybackSource>` — YouTube URLから`YouTubePlayerAdapter`を生成する

## PlaybackSource（インターフェース）
- `load(): Promise<void>` — 再生準備を行う
- `play(): void` — 再生開始
- `pause(): void` — 一時停止
- `seek(timeSec: number): void` — 指定位置へ移動
- `setLoop(aSec: number, bSec: number): void` — ループ区間を設定
- `clearLoop(): void` — ループ解除
- `getCurrentTime(): number`
- `getDuration(): number`
- `onTimeUpdate(callback: (t: number) => void): void`
- `getCapabilities(): PlaybackCapabilities` — `{ supportsEQ, supportsPitchDisplay, supportsWaveform, loopPrecision: "sample" | "approximate" }`

## LocalAudioEngine（PlaybackSourceを実装）
- 上記PlaybackSourceの全メソッド（loopPrecision: "sample"）
- `getAudioBuffer(): AudioBuffer` — デコード済み音声データを公開（Waveform/Pitch用）
- `getAnalyserNode(): AnalyserNode` — Web Audio APIの解析ノードを公開

## YouTubePlayerAdapter（PlaybackSourceを実装）
- 上記PlaybackSourceの全メソッド（loopPrecision: "approximate"）
- `setPlaybackRate(rate: number): void` — YouTube標準の再生速度変更（音程保持はYouTube側で処理）

## BassEQProcessor
- `attach(engine: LocalAudioEngine): void`
- `setGainDb(gain: number): void`
- `getGainDb(): number`
- `bypass(enabled: boolean): void`

## TimeStretchProcessor
- `attach(engine: LocalAudioEngine): void`
- `setRate(rate: number): void` — rate<1で音程を保持したまま低速化
- `getRate(): number`

## PitchDetector
- `attach(engine: LocalAudioEngine): void`
- `start(onDetect: (result: PitchResult) => void): void` — `PitchResult = { noteName: string | null, frequencyHz: number | null, confidence: number }`
- `stop(): void`

## WaveformVisualizer
- `attach(engine: LocalAudioEngine, canvas: HTMLCanvasElement): void`
- `setMode(mode: "waveform" | "spectrogram"): void`
- `render(currentTimeSec: number): void`

## LoopEditor
- `attach(source: PlaybackSource): void`
- `setPointA(timeSec: number): void`
- `setPointB(timeSec: number): void`
- `getLoopPoints(): { a: number, b: number } | null`
- `enableLoop(enabled: boolean): void`

## SongWorkspace
- `openLocalFile(file: File): Promise<void>`
- `openYouTubeUrl(url: string): Promise<void>`
- `getSongKey(): string` — ファイルハッシュ、または正規化したYouTube URL
- `getMemoText(): string`
- `setMemoText(text: string): void`
- `exportState(): SongWorkspaceState` — 同期用にループ区間・メモをシリアライズ
- `importState(state: SongWorkspaceState): void` — 同期取得した状態を復元

## AuthClient
- `login(credentials: Credentials): Promise<Session>`
- `logout(): void`
- `getCurrentSession(): Session | null`

## SyncClient
- `fetchSongData(songKey: string): Promise<SongDataDTO | null>`
- `saveSongData(songKey: string, data: SongDataDTO): Promise<void>`

## PlaybackOrchestrationService
- `openInput(input: File | string): Promise<SongWorkspace>` — AudioInputManagerで判定→適切なPlaybackSourceを生成→Local時はBassEQProcessor/TimeStretchProcessor/PitchDetector/WaveformVisualizerを接続→LoopEditorを接続→SongWorkspaceにまとめる

## SyncOrchestrationService
- `loadForCurrentUser(workspace: SongWorkspace): Promise<void>` — SyncClient.fetchSongDataの結果をworkspace.importStateに渡す
- `save(workspace: SongWorkspace): Promise<void>` — workspace.exportState()をSyncClient.saveSongDataに渡す

## AppBackendAPI（バックエンド）
- `handleRequest(request: Request): Promise<Response>` — トークン検証（deny-by-default）後、`/auth/*`をAuthServiceへ、`/songs/*`をSongDataServiceへルーティング

## AuthService（バックエンド）
- `login(credentials: Credentials): Promise<SessionToken>`
- `validateToken(token: string): Promise<UserId | null>`
- `logout(token: string): Promise<void>`

## SongDataService（バックエンド）
- `getSongData(userId: UserId, songKey: string): Promise<SongDataDTO | null>` — userIdでスコープ
- `saveSongData(userId: UserId, songKey: string, data: SongDataDTO): Promise<void>` — userIdでスコープ

## SongDataStore（バックエンド）
- `read(userId: UserId, songKey: string): Promise<SongDataRecord | null>`
- `write(userId: UserId, songKey: string, record: SongDataRecord): Promise<void>`
