/**
 * =============================================================
 * Formatter Utility — Log Entry Formatting and Metadata
 * =============================================================
 *
 * Formats log entries with automatic metadata injection including
 * timestamp, environment, and application name.
 * Also provides console formatting for fallback logging.
 */

import type {
  StackType,
  LevelType,
  PackageType,
  LogPayload,
  FormattedLogEntry,
} from "../types/logger.types";
import {
  LEVEL_COLORS,
  COLOR_RESET,
  DEFAULT_LOGGER_CONFIG,
} from "../config/constants";

/**
 * Creates the API request payload with only the required fields.
 * This is the exact payload shape expected by the remote logging API.
 *
 * @param stack - The stack identifier (backend/frontend)
 * @param level - The log severity level
 * @param packageName - The package/module name
 * @param message - The log message
 * @returns The formatted API payload
 */
export function createLogPayload(
  stack: StackType,
  level: LevelType,
  packageName: PackageType,
  message: string
): LogPayload {
  return {
    stack,
    level,
    package: packageName,
    message: message.trim(),
  };
}

/**
 * Creates a fully formatted log entry with metadata.
 * Used for internal tracking and console fallback output.
 *
 * @param stack - The stack identifier
 * @param level - The log severity level
 * @param packageName - The package/module name
 * @param message - The log message
 * @param appName - Application name (defaults to config value)
 * @param environment - Current environment (defaults to config value)
 * @returns A complete formatted log entry with metadata
 */
export function createFormattedEntry(
  stack: StackType,
  level: LevelType,
  packageName: PackageType,
  message: string,
  appName: string = DEFAULT_LOGGER_CONFIG.appName,
  environment: string = DEFAULT_LOGGER_CONFIG.environment
): FormattedLogEntry {
  return {
    stack,
    level,
    package: packageName,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    environment,
    appName,
  };
}

/**
 * Formats a log entry as a colored console string for fallback logging.
 * Uses ANSI color codes based on log level severity.
 *
 * @param entry - The formatted log entry to render as console output
 * @returns A colorized string suitable for console output
 *
 * @example Output:
 * [2026-05-08T10:00:00.000Z] [ERROR] [backend:handler] Priority heap insertion failed
 */
export function formatConsoleOutput(entry: FormattedLogEntry): string {
  const color = LEVEL_COLORS[entry.level] || "";
  const levelTag = entry.level.toUpperCase().padEnd(5);

  return (
    `${color}[${entry.timestamp}] ` +
    `[${levelTag}] ` +
    `[${entry.stack}:${entry.package}] ` +
    `${entry.message}${COLOR_RESET}`
  );
}

/**
 * Formats a log entry as a structured JSON string.
 * Useful for structured logging pipelines and log aggregation.
 *
 * @param entry - The formatted log entry
 * @returns A pretty-printed JSON string
 */
export function formatJsonOutput(entry: FormattedLogEntry): string {
  return JSON.stringify(entry, null, 2);
}
