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
    <div className="fader-field" data-testid="speed-control">
      <div className="fader-field__top">
        <label htmlFor="speed-control-slider">速度（音程保持）</label>
        <span className="readout readout--sm readout--teal" data-testid="speed-control-value-label">
          {rate.toFixed(2)}x
        </span>
      </div>
      <input
        id="speed-control-slider"
        className="fader"
        type="range"
        min={MIN_PLAYBACK_RATE}
        max={MAX_PLAYBACK_RATE}
        step={0.05}
        value={rate}
        data-testid="speed-control-slider"
        onChange={(e) => handleChange(Number(e.target.value))}
      />
    </div>
  );
}
