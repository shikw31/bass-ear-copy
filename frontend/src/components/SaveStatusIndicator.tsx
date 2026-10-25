interface Props {
  saved: boolean;
}

// Local-only persistence (no login, no cloud sync — see project decision to drop accounts).
export function SaveStatusIndicator({ saved }: Props) {
  if (!saved) return null;
  return <span data-testid="save-status-indicator">ローカルに保存済み</span>;
}
