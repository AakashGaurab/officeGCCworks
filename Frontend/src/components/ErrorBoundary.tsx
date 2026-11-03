import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorText } from '../constants/Text';
import './StateMessage.css';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

// Last line of defence: an unexpected render error shows a message instead of a blank page.
// Error boundaries must be class components; React has no hook for this yet.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  handleReloadClick = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="state-message state-message-error" role="alert">
        <h1 className="state-message-title">{ErrorText.TITLE}</h1>
        <p>{ErrorText.BOUNDARY_MESSAGE}</p>
        <button className="button" type="button" onClick={this.handleReloadClick}>
          {ErrorText.RELOAD}
        </button>
      </section>
    );
  }
}

export default ErrorBoundary;
