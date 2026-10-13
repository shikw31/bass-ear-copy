import { useRef, useState } from "react";

interface Props {
  onOpenLocalFile: (file: File) => void;
  onOpenYouTubeUrl: (url: string) => void;
  onError: (message: string) => void;
}

export function InputScreen({ onOpenLocalFile, onOpenYouTubeUrl, onError }: Props) {
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
      <section>
        <label htmlFor="input-screen-file-input">音声ファイルを開く（mp3/wav/m4a）</label>
        <input
          id="input-screen-file-input"
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
          data-testid="input-screen-file-input"
          onChange={handleFileChange}
        />
      </section>
      <section>
        <label htmlFor="input-screen-youtube-url-input">YouTube URLを開く</label>
        <input
          id="input-screen-youtube-url-input"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          data-testid="input-screen-youtube-url-input"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <button type="button" data-testid="input-screen-youtube-submit-button" onClick={handleYoutubeSubmit}>
          読み込む
        </button>
      </section>
    </div>
  );
}
