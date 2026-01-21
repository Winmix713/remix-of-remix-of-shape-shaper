import React, { Component, ReactNode } from 'react';
import { AlertCircle, Home, RefreshCw, RotateCcw } from 'lucide-react';
import { logError } from '@/lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary component to catch React errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details
    logError(error, {
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-zinc-950 dark:to-red-950/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                  <p className="text-red-100 text-sm mt-1">
                    Don't worry, we've logged the issue
                  </p>
                </div>
              </div>
            </div>

            {/* Error message */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  Error Details:
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              {/* Recovery options */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Try one of these options:
                </p>

                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] transition-all"
                  aria-label="Try again"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all"
                  aria-label="Reload page"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all"
                  aria-label="Go to home page"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {/* Additional info for developers */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                    Developer Information
                  </summary>
                  <div className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-auto max-h-48">
                    <pre className="text-[10px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
                If this keeps happening, try clearing your browser cache
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
