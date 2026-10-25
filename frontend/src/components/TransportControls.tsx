import { useEffect, useState } from "react";
import type { PlaybackSource } from "../playback/playbackSource";

interface Props {
  playbackSource: PlaybackSource;
}

export function TransportControls({ playbackSource }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = playbackSource.getDuration();
  // No duration means a live source (e.g. microphone input) rather than a seekable track —
  // see microphoneInputSource.ts's getDuration().
  const hasDuration = Number.isFinite(duration) && duration > 0;

  useEffect(() => {
    return playbackSource.onTimeUpdate(setCurrentTime);
  }, [playbackSource]);

  function togglePlay() {
    if (isPlaying) {
      playbackSource.pause();
    } else {
      playbackSource.play();
    }
    setIsPlaying(!isPlaying);
  }

  return (
    <div data-testid="transport-controls">
      <button type="button" data-testid="transport-controls-play-pause-button" onClick={togglePlay}>
        {isPlaying ? "一時停止" : "再生"}
      </button>
      {hasDuration ? (
        <>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            data-testid="transport-controls-seek-bar"
            onChange={(e) => playbackSource.seek(Number(e.target.value))}
          />
          <span data-testid="transport-controls-time-label">
            {currentTime.toFixed(1)} / {duration.toFixed(1)}秒
          </span>
        </>
      ) : (
        <span data-testid="transport-controls-time-label">{currentTime.toFixed(1)}秒</span>
      )}
    </div>
  );
}
