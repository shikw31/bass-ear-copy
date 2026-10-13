// Input validation rules (see business-rules.md)

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
export const ALLOWED_FILE_EXTENSIONS = ["mp3", "wav", "m4a"];
export const MAX_MEMO_LENGTH = 2000;
export const MIN_LOOP_LENGTH_SEC = 0.5;

export type ValidationResult = { valid: true } | { valid: false; error: string };

function extensionOf(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function validateLocalFile(file: File): ValidationResult {
  const ext = extensionOf(file.name);
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `対応していないファイル形式です（mp3/wav/m4aのみ対応）: .${ext}`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "ファイルサイズが大きすぎます（最大100MB）" };
  }
  return { valid: true };
}

const YOUTUBE_URL_PATTERN =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?.*\bv=[A-Za-z0-9_-]{11}|youtu\.be\/[A-Za-z0-9_-]{11})/;

export function validateYouTubeUrl(url: string): ValidationResult {
  if (!YOUTUBE_URL_PATTERN.test(url)) {
    return {
      valid: false,
      error: "YouTubeのURL形式が無効です（youtube.com/watch?v=... または youtu.be/... の形式のみ対応）",
    };
  }
  return { valid: true };
}

export function validateMemoText(text: string): ValidationResult {
  if (text.length > MAX_MEMO_LENGTH) {
    return { valid: false, error: `メモは${MAX_MEMO_LENGTH}文字以内で入力してください` };
  }
  return { valid: true };
}

export function validateLoopPoints(
  a: number,
  b: number,
  durationSec: number,
): ValidationResult {
  if (!(a >= 0 && a < b && b <= durationSec)) {
    return { valid: false, error: "ループ区間が曲の範囲外、またはA点がB点以降になっています" };
  }
  if (b - a < MIN_LOOP_LENGTH_SEC) {
    return { valid: false, error: `ループ区間は${MIN_LOOP_LENGTH_SEC}秒以上にしてください` };
  }
  return { valid: true };
}
