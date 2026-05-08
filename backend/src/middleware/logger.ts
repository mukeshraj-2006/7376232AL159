/**
 * =============================================================
 * Logging Middleware — Express Request/Response Logger
 * =============================================================
 *
 * Logs every HTTP request with:
 * - Timestamp
 * - HTTP method
 * - Route/path
 * - Status code
 * - Response time in milliseconds
 * - Errors (if any)
 *
 * Format: [2026-05-08 10:00:01] GET /notifications 200 45ms
 *
 * Also integrates with the remote logging API via the
 * logging-middleware package.
 */

import { Request, Response, NextFunction } from "express";
import axios from "axios";

/** Logging API endpoint */
const LOG_API_URL = process.env.LOG_API_URL || "http://4.224.186.213/evaluation-service/logs";

/**
 * Sends a log to the remote logging API (fire-and-forget).
 * Does not block the request pipeline.
 */
async function sendRemoteLog(
  level: string,
  packageName: string,
  message: string
): Promise<void> {
  try {
    await axios.post(LOG_API_URL, {
      stack: "backend",
      level,
      package: packageName,
      message,
    }, { timeout: 5000 });
  } catch {
    // Silently fail — don't let logging failures affect the app
  }
}

/**
 * Formats a date to the required log timestamp format.
 * Format: YYYY-MM-DD HH:mm:ss
 */
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * ANSI color codes for status code ranges.
 */
function getStatusColor(statusCode: number): string {
  if (statusCode >= 500) return "\x1b[31m"; // Red
  if (statusCode >= 400) return "\x1b[33m"; // Yellow
  if (statusCode >= 300) return "\x1b[36m"; // Cyan
  if (statusCode >= 200) return "\x1b[32m"; // Green
  return "\x1b[0m"; // Default
}

/**
 * Express logging middleware.
 *
 * Captures request start time and logs the complete request
 * lifecycle on response finish.
 *
 * @example Output:
 * [2026-05-08 10:00:01] GET /api/notifications 200 45ms
 * [2026-05-08 10:00:02] GET /api/notifications/priority?n=10 200 120ms
 * [2026-05-08 10:00:03] GET /api/invalid 404 3ms
 */
export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const timestamp = formatTimestamp(new Date());

  // Listen for response finish event
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const color = getStatusColor(statusCode);
    const reset = "\x1b[0m";

    // Format: [2026-05-08 10:00:01] GET /notifications 200 45ms
    const logLine = `[${timestamp}] ${method} ${url} ${color}${statusCode}${reset} ${responseTime}ms`;

    console.log(logLine);

    // Send to remote logging API (fire-and-forget)
    const level = statusCode >= 400 ? "error" : "info";
    const logMessage = `[${timestamp}] ${method} ${url} ${statusCode} ${responseTime}ms`;
    sendRemoteLog(level, "middleware", logMessage);
  });

  // Listen for errors
  res.on("error", (error: Error) => {
    const responseTime = Date.now() - startTime;
    const logLine = `[${timestamp}] ${req.method} ${req.originalUrl} ERROR ${responseTime}ms - ${error.message}`;

    console.error(`\x1b[31m${logLine}\x1b[0m`);
    sendRemoteLog("error", "middleware", logLine);
  });

  next();
}

/**
 * Error logging middleware.
 * Catches unhandled errors and logs them before passing to error handler.
 */
export function errorLoggingMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timestamp = formatTimestamp(new Date());
  const logLine = `[${timestamp}] ERROR ${req.method} ${req.originalUrl} - ${err.message}`;

  console.error(`\x1b[31m${logLine}\x1b[0m`);
  sendRemoteLog("error", "middleware", logLine);

  next(err);
}
