import React from "react";
import * as Sentry from "@sentry/react";
import { logReactErrorBoundary } from "../utils/errorAgent";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info);
    logReactErrorBoundary(error, { componentStack: info.componentStack });
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-stone-900 p-6 font-sans">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 max-w-md w-full shadow-lg text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl mx-auto flex items-center justify-center border border-red-100">
              <span className="text-2xl font-bold">⚠️</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-sans font-bold">Une erreur est survenue</h1>
              <p className="text-stone-500 text-sm leading-relaxed">
                L'application a rencontré un problème technique. Nos équipes ont été alertées et travaillent sur sa résolution.
              </p>
              {this.state.error && (
                <p className="text-xs font-mono text-red-500 bg-red-50 p-3 rounded-lg overflow-x-auto max-h-24">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer"
              >
                Rafraîchir
              </button>
              <a
                href="mailto:support@olmart.dz"
                className="flex-1 px-5 py-3 border border-stone-200 hover:bg-transparent text-stone-700 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors text-center inline-block"
              >
                Support client
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("SectionErrorBoundary caught an error:", error, info);
    logReactErrorBoundary(error, { componentStack: info.componentStack });
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-white border border-stone-100 rounded-3xl p-6 text-center space-y-4 shadow-sm font-sans my-4">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl mx-auto flex items-center justify-center border border-orange-100">
            <span className="font-bold text-sm">⚠️</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-stone-900">Cette section est temporairement indisponible</h4>
            <p className="text-stone-500 text-xs">Une erreur s'est produite lors du chargement de cette partie de la page.</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 border border-stone-200 hover:bg-transparent text-stone-700 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
