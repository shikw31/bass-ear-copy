import { useState } from "react";
import { MAX_PLAYBACK_RATE, MIN_PLAYBACK_RATE } from "../logic/timeStretchRate";

interface Props {
  onRateChange: (rate: number) => void;
}

export function SpeedControl({ onRateChange }: Props) {
  const [rate, setRate] = useState(1.0);

  function handleChange(value: number) {
    setRate(value);
    onRateChange(value);
  }

  return (
    <div data-testid="speed-control">
      <label htmlFor="speed-control-slider">再生速度（音程保持）</label>
      <input
        id="speed-control-slider"
        type="range"
        min={MIN_PLAYBACK_RATE}
        max={MAX_PLAYBACK_RATE}
        step={0.05}
        value={rate}
        data-testid="speed-control-slider"
        onChange={(e) => handleChange(Number(e.target.value))}
      />
      <span data-testid="speed-control-value-label">{rate.toFixed(2)}x</span>
    </div>
  );
}
