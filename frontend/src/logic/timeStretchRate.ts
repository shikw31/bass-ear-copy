// TimeStretchProcessor rate clamping (see business-logic-model.md section 5, business-rules.md)

export const MIN_PLAYBACK_RATE = 0.25;
export const MAX_PLAYBACK_RATE = 1.0;

export function clampPlaybackRate(rate: number): number {
  return Math.min(MAX_PLAYBACK_RATE, Math.max(MIN_PLAYBACK_RATE, rate));
}
