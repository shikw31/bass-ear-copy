interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: Props) {
  if (!message) return null;
  return (
    <div role="alert" className="toast" data-testid="error-toast">
      <span className="led led--red" aria-hidden="true" />
      <span>{message}</span>
      <button type="button" data-testid="error-toast-dismiss-button" onClick={onDismiss}>
        閉じる
      </button>
    </div>
  );
}
