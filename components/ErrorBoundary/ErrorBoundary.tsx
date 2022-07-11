import React, { PropsWithChildren } from 'react';

class ErrorBoundary extends React.Component<
  PropsWithChildren<{ fallbackComponent?: JSX.Element }>,
  { error?: any; hasError: boolean }
> {
  constructor(props: PropsWithChildren<{ fallbackComponent?: JSX.Element }>) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI
    return { error, hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can use your own error logging service here
    console.log({ error, errorInfo });
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      return (
        this.props.fallbackComponent || (
          <div>
            <h2>
              Failed to render component:{' '}
              {this.state.error instanceof Error ? this.state.error.message : `${this.state.error}`}
            </h2>
            <button
              type="button"
              className="btn"
              onClick={() => this.setState({ hasError: false })}
            >
              Retry
            </button>
            <br />
            <br />
          </div>
        )
      );
    }

    // Return children components in case of no error
    return this.props.children;
  }
}

export default ErrorBoundary;
