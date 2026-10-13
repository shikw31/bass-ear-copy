import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InputScreen } from "../../src/components/InputScreen";

describe("InputScreen", () => {
  it("calls onOpenYouTubeUrl with the entered URL", () => {
    const onOpenYouTubeUrl = vi.fn();
    render(
      <InputScreen onOpenLocalFile={() => {}} onOpenYouTubeUrl={onOpenYouTubeUrl} onError={() => {}} />,
    );

    fireEvent.change(screen.getByTestId("input-screen-youtube-url-input"), {
      target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });
    fireEvent.click(screen.getByTestId("input-screen-youtube-submit-button"));

    expect(onOpenYouTubeUrl).toHaveBeenCalledWith("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("reports an error when submitting an empty YouTube URL", () => {
    const onError = vi.fn();
    render(<InputScreen onOpenLocalFile={() => {}} onOpenYouTubeUrl={() => {}} onError={onError} />);

    fireEvent.click(screen.getByTestId("input-screen-youtube-submit-button"));

    expect(onError).toHaveBeenCalled();
  });

  it("calls onOpenLocalFile when a file is selected", () => {
    const onOpenLocalFile = vi.fn();
    render(
      <InputScreen onOpenLocalFile={onOpenLocalFile} onOpenYouTubeUrl={() => {}} onError={() => {}} />,
    );

    const file = new File(["data"], "song.mp3", { type: "audio/mpeg" });
    const input = screen.getByTestId("input-screen-file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onOpenLocalFile).toHaveBeenCalledWith(file);
  });
});
