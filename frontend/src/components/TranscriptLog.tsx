import type { TranscriptEntry } from "../domain/types";

interface Props {
  entries: TranscriptEntry[];
  onClear: () => void;
  onCopyToMemo: (text: string) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function entryToLine(entry: TranscriptEntry): string {
  return `${formatTime(entry.time)}  ${entry.note}${entry.position ? `（${entry.position}）` : ""}`;
}

// TranscriptLog: auto-recorded notes from the live pitch detector (see noteTranscriptLogger.ts).
// Not full song transcription — see requirements.md Change Log for the scoped-down decision —
// but solves the actual pain point (playing is too fast to type notes down by hand).
export function TranscriptLog({ entries, onClear, onCopyToMemo }: Props) {
  return (
    <div data-testid="transcript-log">
      <div className="fader-field__top">
        <span className="field-label" style={{ margin: 0 }}>
          採譜ログ（自動記録）
        </span>
        <span className="readout readout--sm readout--idle">{entries.length}件</span>
      </div>
      <div className="transcript-log__list" data-testid="transcript-log-list">
        {entries.length === 0 ? (
          <p className="panel__hint">再生すると、検出した音が自動でここに記録されます。</p>
        ) : (
          entries
            .slice()
            .reverse()
            .map((entry, i) => (
              <div className="transcript-log__row" key={`${entry.time}-${i}`}>
                <span className="readout readout--sm readout--idle">{formatTime(entry.time)}</span>
                <span className="readout readout--sm">{entry.note}</span>
                {entry.position && <span className="readout readout--sm readout--teal">{entry.position}</span>}
              </div>
            ))
        )}
      </div>
      {entries.length > 0 && (
        <div className="panel__row" style={{ marginTop: 10 }}>
          <button
            type="button"
            className="btn"
            data-testid="transcript-log-copy-button"
            onClick={() => onCopyToMemo(entries.map(entryToLine).join("\n"))}
          >
            メモにコピー
          </button>
          <button type="button" className="btn btn--ghost" data-testid="transcript-log-clear-button" onClick={onClear}>
            クリア
          </button>
        </div>
      )}
    </div>
  );
}
