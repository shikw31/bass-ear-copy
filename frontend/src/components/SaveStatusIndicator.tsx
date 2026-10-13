import type { SyncStatus } from "../services/syncOrchestrationService";

interface Props {
  status: SyncStatus | null;
}

const LABELS: Record<SyncStatus, string> = {
  "saved-locally": "ローカルに保存済み",
  synced: "クラウドに同期済み",
  "sync-pending": "同期待ち（再試行中）",
  "sync-failed": "同期に失敗しました",
};

export function SaveStatusIndicator({ status }: Props) {
  if (!status) return null;
  return <span data-testid="save-status-indicator">{LABELS[status]}</span>;
}
