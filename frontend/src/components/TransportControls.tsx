import { useEffect, useRef, useState } from "react";
import type { PlaybackSource } from "../playback/playbackSource";

interface Props {
  playbackSource: PlaybackSource;
  autoPlay?: boolean;
  playLabel?: string;
  pauseLabel?: string;
}

export function TransportControls({
  playbackSource,
  autoPlay = false,
  playLabel = "再生",
  pauseLabel = "一時停止",
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = playbackSource.getDuration();
  // No duration means a live source (e.g. microphone input) rather than a seekable track —
  // see microphoneInputSource.ts's getDuration().
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const hasAutoStarted = useRef(false);

  useEffect(() => {
    return playbackSource.onTimeUpdate(setCurrentTime);
  }, [playbackSource]);

  // autoPlay exists for sources with no separate "load, then press play" step worth exposing
  // (mic input: the "load" step already asked for permission, so a second manual play button
  // was confusing — see conversation-log.md feedback). Runs once per mounted source.
  useEffect(() => {
    if (autoPlay && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      playbackSource.play();
      setIsPlaying(true);
    }
  }, [autoPlay, playbackSource]);

  function togglePlay() {
    if (isPlaying) {
      playbackSource.pause();
    } else {
      playbackSource.play();
    }
    setIsPlaying(!isPlaying);
  }

  return (
    <div className="panel__row" data-testid="transport-controls">
      <button
        type="button"
        className={isPlaying ? "btn btn--accent" : "btn"}
        data-testid="transport-controls-play-pause-button"
        onClick={togglePlay}
      >
        {isPlaying ? `⏸ ${pauseLabel}` : `▶ ${playLabel}`}
      </button>
      {hasDuration ? (
        <>
          <input
            type="range"
            className="fader"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            data-testid="transport-controls-seek-bar"
            onChange={(e) => playbackSource.seek(Number(e.target.value))}
            style={{ flex: 1, minWidth: 90 }}
          />
          <span className="readout readout--sm transport__clock" data-testid="transport-controls-time-label">
            {currentTime.toFixed(1)} / {duration.toFixed(1)}秒
          </span>
        </>
      ) : (
        <span className="readout readout--sm transport__clock" data-testid="transport-controls-time-label">
          {currentTime.toFixed(1)}秒
        </span>
      )}
    </div>
  );
}
