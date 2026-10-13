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
      <label htmlFor="memo-editor-textarea">メモ（TAB／運指メモなど）</label>
      <textarea
        id="memo-editor-textarea"
        data-testid="memo-editor-textarea"
        value={text}
        maxLength={MAX_MEMO_LENGTH}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onCommit(text)}
      />
      <span data-testid="memo-editor-char-count">
        {text.length} / {MAX_MEMO_LENGTH}
      </span>
    </div>
  );
}
