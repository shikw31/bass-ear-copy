import { useEffect, useState } from "react";
import type { PlaybackSource } from "../playback/playbackSource";

interface Props {
  playbackSource: PlaybackSource;
}

export function TransportControls({ playbackSource }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = playbackSource.getDuration();

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
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        data-testid="transport-controls-seek-bar"
        onChange={(e) => playbackSource.seek(Number(e.target.value))}
      />
      <span data-testid="transport-controls-time-label">
        {currentTime.toFixed(1)} / {duration.toFixed(1)}秒
      </span>
    </div>
  );
}
