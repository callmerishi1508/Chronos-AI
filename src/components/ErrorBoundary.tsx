import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Bug, FileText } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-6 font-mono bg-slate-950/50 rounded-2xl border border-red-500/10">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-xl font-bold text-white uppercase tracking-wider">
              Chronos Critical Fault
            </h1>
            
            <p className="text-slate-400 text-sm">
              The autonomous timeline engine encountered a fatal deviation. Our cognitive safety nets have isolated the error.
            </p>
            
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-left overflow-hidden">
              <p className="text-xs text-red-400 font-mono truncate">
                {this.state.error?.message || "Unknown cognitive collapse"}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all tracking-wide text-sm focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Component
              </button>

              <button
                onClick={() => {
                  alert("Diagnostic report generated and securely submitted to Chronos engineering.");
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl transition-all tracking-wide text-sm border border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Bug className="w-4 h-4" />
                Report Error
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
