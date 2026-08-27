import pino from "pino";

/**
 * Strips carriage returns, newlines, and other ASCII control characters to prevent log injection (CWE-117).
 */
export function sanitizeString(val: string): string {
  if (!val) return "";
  return val
    .replace(/[\r\n]+/g, " ")
    /* eslint-disable-next-line no-control-regex */
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
}

/**
 * Recursively sanitizes data objects before logging, preventing log injection and redacting personal data (PII).
 */
export function sanitizeVal<T>(val: T): T {
  if (val === null || val === undefined) {
    return val;
  }
  if (typeof val === "string") {
    return sanitizeString(val) as unknown as T;
  }
  if (val instanceof Error) {
    return {
      message: sanitizeString(val.message),
      name: sanitizeString(val.name),
      stack: val.stack ? sanitizeString(val.stack) : undefined
    } as unknown as T;
  }
  if (Array.isArray(val)) {
    return val.map((item) => sanitizeVal(item)) as unknown as T;
  }
  if (typeof val === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, kVal] of Object.entries(val)) {
      const lowerKey = key.toLowerCase();
      // Redact sensitive data and PII
      if (
        lowerKey.includes("fullname") ||
        lowerKey.includes("password") ||
        lowerKey.includes("email") ||
        lowerKey.includes("phone") ||
        lowerKey.includes("token") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("card") ||
        lowerKey.includes("cvv")
      ) {
        sanitizedObj[key] = "[REDACTED_PII]";
      } else {
        sanitizedObj[key] = sanitizeVal(kVal);
      }
    }
    return sanitizedObj as T;
  }
  return val;
}

// Configured Pino instance
export const loggerInstance = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  }
});

// Safe logger wrapper implementing sanitization for all outputs to resolve CodeQL CWE-117
export const safeLogger = {
  info(msg: string, context?: Record<string, unknown>) {
    loggerInstance.info(sanitizeVal(context || {}), sanitizeString(msg));
  },
  warn(msg: string, context?: Record<string, unknown>) {
    loggerInstance.warn(sanitizeVal(context || {}), sanitizeString(msg));
  },
  error(msg: string, context?: Record<string, unknown>) {
    loggerInstance.error(sanitizeVal(context || {}), sanitizeString(msg));
  },
  debug(msg: string, context?: Record<string, unknown>) {
    loggerInstance.debug(sanitizeVal(context || {}), sanitizeString(msg));
  }
};
