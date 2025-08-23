import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="text-red-600">Có lỗi xảy ra khi hiển thị giao dịch.</p>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
