import { auth } from '../lib/firebase';
import * as Sentry from '@sentry/react';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  type: 'react_boundary' | 'unhandled_promise' | 'window_error';
  url: string;
  userAgent: string;
  timestamp: string;
}

const sanitizeErrorInfo = (info: Omit<ErrorInfo, 'timestamp' | 'url' | 'userAgent'>) => {
  const scrubText = (text: string | undefined): string => {
    if (!text) return "";
    return text
      .replace(/(?:\/[^/\s]+)*\/src\/[^\s)]+/g, '[internal_code]')
      .replace(/(?:http|https):\/\/[^\s)]+/gi, '[origin_source]')
      .replace(/at\s+([a-zA-Z0-9_$]+)\s+\([^)]+\)/g, 'at $1([internal])')
      .trim();
  };

  return {
    ...info,
    message: info.message ? info.message.replace(/(?:\/[^/\s]+)*\/src\/[^\s]+/g, '[path]') : '',
    stack: scrubText(info.stack),
    componentStack: scrubText(info.componentStack),
  };
};

const sendErrorToAgent = async (errorInfo: Omit<ErrorInfo, 'timestamp' | 'url' | 'userAgent'>) => {
  try {
    const sanitized = sanitizeErrorInfo(errorInfo);

    // Capture exception in Sentry for professional issue tracking
    Sentry.captureException(new Error(errorInfo.message), {
      extra: {
        stack: errorInfo.stack,
        componentStack: errorInfo.componentStack,
        type: errorInfo.type,
      },
    });

    if (!auth.currentUser) {
      // Only log to database if user is authenticated (prevents anonymous spamming of the database)
      return;
    }

    // Call server-side endpoint via standard fetch
    await fetch('/api/v1/logs/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        ...sanitized,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: auth.currentUser?.uid || null,
      })
    });

    (process.env.NODE_ENV === 'development' ? console.log : function(){})('[ErrorAgent] Erreur reportée avec succès.');
  } catch (err) {
    console.error('[ErrorAgent] Impossible de reporter l\'erreur :', err);
  }
};

export const setupErrorAgent = () => {
  window.addEventListener('error', (event) => {
    sendErrorToAgent({
      message: event.message,
      stack: event.error?.stack,
      type: 'window_error'
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    sendErrorToAgent({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      type: 'unhandled_promise'
    });
  });
};

export const logReactErrorBoundary = (error: unknown, info: { componentStack?: string | null }) => {
  const err = error instanceof Error ? error : new Error(String(error));
  sendErrorToAgent({
    message: err.message,
    stack: err.stack,
    type: 'react_boundary',
    componentStack: info.componentStack || undefined,
  });
};
