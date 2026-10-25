import { useState } from "react";
import { MAX_MEMO_LENGTH } from "../logic/validation";

interface Props {
  initialText: string;
  onCommit: (text: string) => void;
}

export function MemoEditor({ initialText, onCommit }: Props) {
  const [text, setText] = useState(initialText);

  return (
    <div data-testid="memo-editor">
      <div className="fader-field__top">
        <label className="field-label" htmlFor="memo-editor-textarea" style={{ margin: 0 }}>
          TAB / 運指メモ
        </label>
        <span className="readout readout--sm readout--idle" data-testid="memo-editor-char-count">
          {text.length} / {MAX_MEMO_LENGTH}
        </span>
      </div>
      <textarea
        id="memo-editor-textarea"
        className="memo-textarea"
        data-testid="memo-editor-textarea"
        value={text}
        maxLength={MAX_MEMO_LENGTH}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onCommit(text)}
      />
    </div>
  );
}
