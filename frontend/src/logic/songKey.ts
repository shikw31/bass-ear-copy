// SongKey generation (see business-logic-model.md section 2)
// Local files: SHA-256 hash of file content -> deterministic key for identical content.
// YouTube: normalize to "yt:<videoId>" so query-string differences don't change the key.

export async function songKeyForLocalFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const hashHex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `local:${hashHex}`;
}

const YOUTUBE_ID_PATTERNS = [
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?.*\bv=([A-Za-z0-9_-]{11})/,
  /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{11})/,
];

export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export function songKeyForYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `yt:${videoId}` : null;
}
