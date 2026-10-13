interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: Props) {
  if (!message) return null;
  return (
    <div role="alert" data-testid="error-toast">
      <span>{message}</span>
      <button type="button" data-testid="error-toast-dismiss-button" onClick={onDismiss}>
        閉じる
      </button>
    </div>
  );
}
