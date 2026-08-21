import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Uncaught error:", error, info);
    this.setState({ error, errorInfo: info.componentStack });
  }

  handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.error) return this.props.children;

    const { error, errorInfo } = this.state;

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-red-400 mb-1">
                Something went wrong
              </h1>
              <p className="text-white/70 text-sm">
                An unexpected error occurred. The issue has been logged.
              </p>
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-lg p-4 mb-6 max-h-64 overflow-auto">
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
              Error message
            </p>
            <p className="text-red-300 font-mono text-sm break-words mb-3">
              {error.message || String(error)}
            </p>
            {errorInfo && (
              <>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2 mt-4">
                  Component stack
                </p>
                <pre className="text-white/60 font-mono text-xs whitespace-pre-wrap">
                  {errorInfo.trim().split("\n").slice(0, 8).join("\n")}
                </pre>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={this.handleReset} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
            <Button onClick={this.handleReload} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reload page
            </Button>
            <Button onClick={this.handleHome} variant="ghost" className="gap-2">
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;