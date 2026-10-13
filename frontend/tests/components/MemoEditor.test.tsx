import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoEditor } from "../../src/components/MemoEditor";

describe("MemoEditor", () => {
  it("commits the current text on blur", () => {
    const onCommit = vi.fn();
    render(<MemoEditor initialText="" onCommit={onCommit} />);

    const textarea = screen.getByTestId("memo-editor-textarea");
    fireEvent.change(textarea, { target: { value: "Verse: root-5th pattern" } });
    fireEvent.blur(textarea);

    expect(onCommit).toHaveBeenCalledWith("Verse: root-5th pattern");
  });

  it("shows a live character count", () => {
    render(<MemoEditor initialText="abc" onCommit={() => {}} />);
    expect(screen.getByTestId("memo-editor-char-count")).toHaveTextContent("3 / 2000");
  });
});
