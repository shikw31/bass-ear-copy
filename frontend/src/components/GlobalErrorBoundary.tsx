import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// GlobalErrorBoundary (see nfr-design-patterns.md: Reliability). Catches unhandled render
// errors and shows a generic message — never stack traces or internal details (SECURITY-15).
export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled application error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rack" role="alert" data-testid="global-error-boundary-message">
          <div className="boundary-fallback">予期しないエラーが発生しました。ページを再読み込みしてください。</div>
        </div>
      );
    }
    return this.props.children;
  }
}
