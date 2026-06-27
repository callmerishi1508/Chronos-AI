/**
 * Structured Logger
 * Masks sensitive data in production and prevents stack traces from leaking to standard out.
 */

const isProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";

function sanitizeArgs(args: any[]): any[] {
  if (!isProd) return args; // Return raw args in dev
  
  return args.map(arg => {
    if (arg instanceof Error) {
      return `[Error] ${arg.message}`; // Strip stack trace in prod
    }
    if (typeof arg === "object" && arg !== null) {
      // Strip potentially sensitive keys
      const sanitized = { ...arg };
      ["prompt", "history", "apiKey", "password", "token"].forEach(key => {
        if (key in sanitized) sanitized[key] = "[REDACTED]";
      });
      return JSON.stringify(sanitized);
    }
    return arg;
  });
}

export const logger = {
  debug: (...args: any[]) => {
    if (!isProd) console.debug("[DEBUG]", ...sanitizeArgs(args));
  },
  info: (...args: any[]) => {
    console.info("[INFO]", ...sanitizeArgs(args));
  },
  warn: (...args: any[]) => {
    console.warn("[WARN]", ...sanitizeArgs(args));
  },
  error: (...args: any[]) => {
    console.error("[ERROR]", ...sanitizeArgs(args));
  }
};
