interface Props {
  saved: boolean;
}

// Local-only persistence (no login, no cloud sync — see project decision to drop accounts).
export function SaveStatusIndicator({ saved }: Props) {
  if (!saved) return null;
  return (
    <span className="chip" data-testid="save-status-indicator">
      <span className="led led--amber" style={{ width: 6, height: 6 }} aria-hidden="true" />
      ローカルに保存済み
    </span>
  );
}
