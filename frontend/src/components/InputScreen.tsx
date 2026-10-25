import { useRef, useState } from "react";

interface Props {
  onOpenLocalFile: (file: File) => void;
  onOpenYouTubeUrl: (url: string) => void;
  onOpenMicInput: () => void;
  onError: (message: string) => void;
}

export function InputScreen({ onOpenLocalFile, onOpenYouTubeUrl, onOpenMicInput, onError }: Props) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange() {
    const file = fileInputRef.current?.files?.[0];
    if (file) onOpenLocalFile(file);
  }

  function handleYoutubeSubmit() {
    if (!youtubeUrl) {
      onError("YouTubeのURLを入力してください");
      return;
    }
    onOpenYouTubeUrl(youtubeUrl);
  }

  return (
    <div data-testid="input-screen">
      <div className="panel">
        <span className="panel__label">Source 1 / File</span>
        <label className="field-label" htmlFor="input-screen-file-input">
          音声ファイルを開く（mp3 / wav / m4a）
        </label>
        <div className="file-input-wrap">
          <input
            id="input-screen-file-input"
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
            data-testid="input-screen-file-input"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <span className="panel__label">Source 2 / YouTube</span>
        <label className="field-label" htmlFor="input-screen-youtube-url-input">
          YouTube URLを開く
        </label>
        <div className="panel__row">
          <input
            id="input-screen-youtube-url-input"
            className="text-input"
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            data-testid="input-screen-youtube-url-input"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <button
            type="button"
            className="btn btn--accent"
            data-testid="input-screen-youtube-submit-button"
            onClick={handleYoutubeSubmit}
          >
            読み込む
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <span className="panel__label">Source 3 / Mic Line-In</span>
        <p className="panel__hint">
          YouTube等を別端末で再生しつつ、マイク経由で低音域EQ・音程表示・波形表示を使いたい場合。
          <strong style={{ color: "var(--amber)" }}> ヘッドホン推奨</strong>
          — スピーカーだとマイクが音を拾ってハウリングします。
        </p>
        <button
          type="button"
          className="btn btn--block"
          data-testid="input-screen-mic-input-button"
          onClick={onOpenMicInput}
          style={{ marginTop: 10 }}
        >
          マイク入力を開始
        </button>
      </div>
    </div>
  );
}
