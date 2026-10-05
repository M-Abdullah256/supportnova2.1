import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SupportNova Error Boundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReload = () => {
    try {
      localStorage.removeItem('supportnova_user_session');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F0F0F] text-[#E6E2D8]">
          <div className="max-w-xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl bg-[#121212] border border-[#D83B20]/40 relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#D83B20]/10 border border-[#D83B20]/30 text-[#D83B20]">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="display text-lg text-[#E6E2D8]">
                  Runtime Isolation Triggered
                </h1>
                <p className="label text-[10px] text-[#D83B20] mt-0.5">
                  SupportNova Resilience Engine Intercept
                </p>
              </div>
            </div>

            <p className="text-xs mb-4 text-[#E6E2D8]/70 leading-relaxed font-mono">
              An unexpected render exception was trapped. System state has been quarantined to prevent cascaded payload corruption.
            </p>

            {this.state.error && (
              <div className="mb-5 p-3 rounded-lg text-xs font-mono break-words bg-[#D83B20]/10 border border-[#D83B20]/25 text-[#D83B20]">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5 mb-4">
              <button
                onClick={this.handleReset}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-[#D83B20] text-white hover:bg-[#b82f17] shadow-md transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recover State</span>
              </button>

              <button
                onClick={this.handleHardReload}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider bg-[#1A1A1A] text-[#E6E2D8] border border-[#E6E2D8]/20 hover:border-[#D83B20] transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-mono text-[#E6E2D8]/50 hover:text-white transition ml-auto cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{this.state.showDetails ? 'Hide Stack' : 'Show Stack'}</span>
                {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {this.state.showDetails && (
              <div className="mt-4 pt-4 border-t border-[#E6E2D8]/15">
                <p className="label text-[10px] text-[#E6E2D8]/60 mb-2">Diagnostic Trace:</p>
                <pre className="max-h-48 overflow-y-auto p-3 rounded text-[10px] font-mono whitespace-pre-wrap bg-[#181818] border border-[#E6E2D8]/10 text-[#E6E2D8]/80">
                  {this.state.error?.stack || 'No stack trace available.'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}