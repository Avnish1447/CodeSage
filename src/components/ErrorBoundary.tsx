import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CodeSage ErrorBoundary] Uncaught render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090b] text-[#171717] dark:text-[#EDEDED] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white dark:bg-[#111113] rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_8px_30px_rgba(0,0,0,0.4)] p-8 text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-[#171717] dark:text-[#EDEDED]">
                Workbench Render Error
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] dark:text-[#888888] leading-relaxed">
                An unexpected interface exception occurred. Your cached repository data remains safely stored.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-3.5 max-h-36 overflow-y-auto font-mono text-[11px] text-red-600 dark:text-red-400">
                <p className="font-semibold">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                aria-label="Try again and recover interface"
                className="w-full sm:w-auto px-4 py-2 bg-[#171717] hover:bg-[#2c2c2c] dark:bg-[#EDEDED] dark:hover:bg-white text-white dark:text-[#171717] rounded-lg text-xs font-medium shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                aria-label="Reload entire application"
                className="w-full sm:w-auto px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#171717] dark:text-[#EDEDED] border border-black/[0.06] dark:border-white/[0.08] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
