/**
 * =============================================================
 * Constants — Configuration Constants for Logging Middleware
 * =============================================================
 *
 * Central source of truth for all valid values, defaults, and
 * configuration constants used across the logging package.
 */

import type {
  StackType,
  LevelType,
  BackendPackageType,
  FrontendPackageType,
  CommonPackageType,
  LoggerConfig,
  RetryConfig,
} from "../types/logger.types";

// ─── Valid Stack Values ─────────────────────────────────────
/** All valid stack identifiers */
export const VALID_STACKS: readonly StackType[] = [
  "backend",
  "frontend",
] as const;

// ─── Valid Log Levels ───────────────────────────────────────
/** All valid log levels in ascending severity order */
export const VALID_LEVELS: readonly LevelType[] = [
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
] as const;

// ─── Valid Package Names ────────────────────────────────────
/** Backend-specific package names */
export const BACKEND_PACKAGES: readonly BackendPackageType[] = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
] as const;

/** Frontend-specific package names */
export const FRONTEND_PACKAGES: readonly FrontendPackageType[] = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
] as const;

/** Common package names valid for both stacks */
export const COMMON_PACKAGES: readonly CommonPackageType[] = [
  "auth",
  "config",
  "middleware",
  "utils",
] as const;

// ─── Package Mapping ────────────────────────────────────────
/**
 * Maps each stack to its valid package names.
 * Backend packages = backend-only + common
 * Frontend packages = frontend-only + common
 */
export const STACK_PACKAGE_MAP: Record<StackType, readonly string[]> = {
  backend: [...BACKEND_PACKAGES, ...COMMON_PACKAGES],
  frontend: [...FRONTEND_PACKAGES, ...COMMON_PACKAGES],
} as const;

// ─── Message Constraints ────────────────────────────────────
/** Minimum allowed message length */
export const MIN_MESSAGE_LENGTH = 1;

/** Maximum allowed message length */
export const MAX_MESSAGE_LENGTH = 2000;

// ─── Default Configuration ──────────────────────────────────
/** Default logger configuration values */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  apiUrl: "http://4.224.186.213/evaluation-service/logs",
  appName: "campus-notifications",
  environment: process.env.NODE_ENV || "development",
  timeoutMs: 5000,
  maxRetries: 3,
  consoleFallback: true,
  enableBatching: false,
  batchSize: 10,
  batchFlushIntervalMs: 5000,
};

// ─── Retry Configuration ────────────────────────────────────
/** Default retry configuration with exponential backoff */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
};

// ─── HTTP Configuration ─────────────────────────────────────
/** Default request timeout in milliseconds */
export const DEFAULT_TIMEOUT_MS = 5000;

/** HTTP headers for the logging API */
export const LOG_API_HEADERS = {
  "Content-Type": "application/json",
} as const;

// ─── Console Colors for Fallback Logging ────────────────────
/** ANSI color codes for console output by log level */
export const LEVEL_COLORS: Record<LevelType, string> = {
  debug: "\x1b[36m",   // Cyan
  info: "\x1b[32m",    // Green
  warn: "\x1b[33m",    // Yellow
  error: "\x1b[31m",   // Red
  fatal: "\x1b[35m",   // Magenta
} as const;

/** ANSI reset code */
export const COLOR_RESET = "\x1b[0m";
