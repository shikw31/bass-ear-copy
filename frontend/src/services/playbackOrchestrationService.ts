import { detectInputType, loadLocalFile, loadYouTubeUrl } from "../logic/audioInputManager";
import { songKeyForLocalFile, songKeyForYouTubeUrl } from "../logic/songKey";
import { MicrophoneInputSource } from "../playback/microphoneInputSource";
import { SongWorkspace } from "./songWorkspace";

// Fixed key: a mic session isn't tied to a specific file/URL, so notes just persist across
// mic sessions in general rather than per distinct "song".
const MIC_SESSION_SONG_KEY = "mic:session";

// PlaybackOrchestrationService (see services.md): the single entry point the UI calls to go
// from "a file or a URL" to a fully wired SongWorkspace, regardless of which PlaybackSource ends
// up underneath.
export async function openInput(
  input: File | string,
  youtubeContainer: HTMLElement | null,
): Promise<SongWorkspace> {
  const type = detectInputType(input);

  if (type === "local") {
    const file = input as File;
    const [source, songKey] = await Promise.all([loadLocalFile(file), songKeyForLocalFile(file)]);
    return new SongWorkspace({ songKey, sourceType: "local", source });
  }

  if (type === "youtube") {
    const url = input as string;
    if (!youtubeContainer) {
      throw new Error("YouTube再生用のコンテナ要素が必要です");
    }
    const songKey = songKeyForYouTubeUrl(url);
    if (!songKey) throw new Error("YouTubeのURLからIDを取得できませんでした");
    const source = await loadYouTubeUrl(url, youtubeContainer);
    return new SongWorkspace({ songKey, sourceType: "youtube", source });
  }

  throw new Error("入力が無効です（対応ファイル形式、またはYouTube URLを指定してください）");
}

export async function openMicInput(): Promise<SongWorkspace> {
  const source = new MicrophoneInputSource();
  try {
    await source.load();
  } catch {
    throw new Error("マイクへのアクセスが許可されませんでした");
  }
  return new SongWorkspace({ songKey: MIC_SESSION_SONG_KEY, sourceType: "mic", source });
}
