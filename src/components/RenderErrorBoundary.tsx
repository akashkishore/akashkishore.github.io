import { Component, type ErrorInfo, type JSX, type ReactNode } from "react";

interface RenderErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  resetKey?: string;
}

interface RenderErrorBoundaryState {
  hasError: boolean;
}

export class RenderErrorBoundary extends Component<RenderErrorBoundaryProps, RenderErrorBoundaryState> {
  override state: RenderErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): RenderErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(_error: Error, _info: ErrorInfo): void {}

  override componentDidUpdate(prevProps: RenderErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  override render(): JSX.Element {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }

    return <>{this.props.children}</>;
  }
}
