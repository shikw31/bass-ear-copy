import { useState } from "react";
import type { BassEqProcessor } from "../playback/bassEqProcessor";
import { EQ_MAX_GAIN_DB, EQ_MIN_GAIN_DB } from "../logic/bassEqGain";

interface Props {
  eqProcessor: BassEqProcessor;
}

export function EQControl({ eqProcessor }: Props) {
  const [gainDb, setGainDb] = useState(eqProcessor.getGainDb());

  function handleChange(value: number) {
    setGainDb(value);
    eqProcessor.setGainDb(value);
  }

  return (
    <div data-testid="eq-control">
      <label htmlFor="eq-control-slider">低音域強調EQ</label>
      <input
        id="eq-control-slider"
        type="range"
        min={EQ_MIN_GAIN_DB}
        max={EQ_MAX_GAIN_DB}
        step={0.5}
        value={gainDb}
        data-testid="eq-control-slider"
        onChange={(e) => handleChange(Number(e.target.value))}
      />
      <span data-testid="eq-control-value-label">{gainDb.toFixed(1)}dB</span>
    </div>
  );
}
