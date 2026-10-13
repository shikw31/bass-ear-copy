import type { PlaybackSource } from "../playback/playbackSource";
import { LocalAudioEngine } from "../playback/localAudioEngine";
import { YouTubePlayerAdapter } from "../playback/youtubePlayerAdapter";
import { extractYouTubeVideoId } from "./songKey";
import { validateLocalFile, validateYouTubeUrl } from "./validation";

// AudioInputManager (see components.md / component-methods.md).
export type InputType = "local" | "youtube" | "invalid";

export function detectInputType(input: File | string): InputType {
  if (input instanceof File) return "local";
  return validateYouTubeUrl(input).valid ? "youtube" : "invalid";
}

export async function loadLocalFile(file: File): Promise<PlaybackSource> {
  const result = validateLocalFile(file);
  if (!result.valid) throw new Error(result.error);
  const engine = new LocalAudioEngine(file);
  await engine.load();
  return engine;
}

export async function loadYouTubeUrl(url: string, container: HTMLElement): Promise<PlaybackSource> {
  const result = validateYouTubeUrl(url);
  if (!result.valid) throw new Error(result.error);
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) throw new Error("YouTubeの動画IDを取得できませんでした");
  const adapter = new YouTubePlayerAdapter(container, videoId);
  await adapter.load();
  return adapter;
}
