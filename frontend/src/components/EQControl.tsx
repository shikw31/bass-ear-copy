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
    <div className="fader-field" data-testid="eq-control">
      <div className="fader-field__top">
        <label htmlFor="eq-control-slider">低音域ブースト（〜100Hz）</label>
        <span className="readout" data-testid="eq-control-value-label">
          {gainDb > 0 ? "+" : ""}
          {gainDb.toFixed(1)}dB
        </span>
      </div>
      <input
        id="eq-control-slider"
        className="fader"
        type="range"
        min={EQ_MIN_GAIN_DB}
        max={EQ_MAX_GAIN_DB}
        step={0.5}
        value={gainDb}
        data-testid="eq-control-slider"
        onChange={(e) => handleChange(Number(e.target.value))}
      />
    </div>
  );
}
