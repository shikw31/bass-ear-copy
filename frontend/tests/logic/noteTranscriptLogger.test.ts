import { describe, expect, it, vi } from "vitest";
import type { PitchResult } from "../../src/domain/types";
import { NoteTranscriptLogger } from "../../src/logic/noteTranscriptLogger";

function detected(noteName: string, frequencyHz: number): PitchResult {
  return { noteName, frequencyHz, confidence: 0.9, detected: true };
}

const UNDETECTED: PitchResult = { noteName: null, frequencyHz: null, confidence: 0, detected: false };

describe("NoteTranscriptLogger (debounces the ~30Hz detection stream into note-held events)", () => {
  it("does not log until the same note has been seen 2 times in a row (~67ms at 30Hz)", () => {
    const onNoteHeld = vi.fn();
    const logger = new NoteTranscriptLogger(onNoteHeld);

    logger.observe(detected("E2", 82.41));
    expect(onNoteHeld).not.toHaveBeenCalled();

    logger.observe(detected("E2", 82.41));
    expect(onNoteHeld).toHaveBeenCalledWith("E2", 82.41);
    expect(onNoteHeld).toHaveBeenCalledOnce();
  });

  it("does not log the same held note twice while it is sustained", () => {
    const onNoteHeld = vi.fn();
    const logger = new NoteTranscriptLogger(onNoteHeld);

    for (let i = 0; i < 10; i++) logger.observe(detected("A2", 110));

    expect(onNoteHeld).toHaveBeenCalledOnce();
  });

  it("logs again once the note changes and re-stabilizes", () => {
    const onNoteHeld = vi.fn();
    const logger = new NoteTranscriptLogger(onNoteHeld);

    logger.observe(detected("E2", 82.41));
    logger.observe(detected("E2", 82.41));
    logger.observe(detected("A2", 110));
    logger.observe(detected("A2", 110));

    expect(onNoteHeld).toHaveBeenNthCalledWith(1, "E2", 82.41);
    expect(onNoteHeld).toHaveBeenNthCalledWith(2, "A2", 110);
  });

  it("resets the pending streak on an undetected tick (silence/noise doesn't count toward stability)", () => {
    const onNoteHeld = vi.fn();
    const logger = new NoteTranscriptLogger(onNoteHeld);

    logger.observe(detected("E2", 82.41));
    logger.observe(UNDETECTED);
    logger.observe(detected("E2", 82.41));
    expect(onNoteHeld).not.toHaveBeenCalled();

    logger.observe(detected("E2", 82.41));
    expect(onNoteHeld).toHaveBeenCalledOnce();
  });

  it("reset() allows the same note to be logged again (e.g. after clearing the transcript)", () => {
    const onNoteHeld = vi.fn();
    const logger = new NoteTranscriptLogger(onNoteHeld);
    logger.observe(detected("E2", 82.41));
    logger.observe(detected("E2", 82.41));
    expect(onNoteHeld).toHaveBeenCalledOnce();

    logger.reset();
    logger.observe(detected("E2", 82.41));
    logger.observe(detected("E2", 82.41));
    expect(onNoteHeld).toHaveBeenCalledTimes(2);
  });
});
