import { Component } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

/**
 * ErrorBoundary Component
 *
 * This component catches React errors in its child component tree and displays
 * a fallback UI instead of crashing the entire app. It's a safety net for
 * production environments.
 *
 * Safe: This is an additive change that doesn't modify existing behavior.
 * It only activates when an error occurs, providing graceful degradation.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    // Safe: Console logging doesn't affect app functionality
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Placeholder for future error logging service (e.g., Sentry)
    // When Sentry is integrated, we can add:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    // Reset error state to try rendering the component again
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    // Navigate to home page and reset error state
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg border border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-gray-400 text-sm">
                  {this.props.message || "We're sorry for the inconvenience"}
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm mb-2">
                The application encountered an unexpected error. This has been
                logged for investigation.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-400 text-xs hover:text-gray-300">
                    View error details (development only)
                  </summary>
                  <pre className="mt-2 text-xs text-red-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2 border-gray-600 hover:bg-gray-700"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
