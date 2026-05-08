/**
 * =============================================================
 * Logger Types — Type Definitions for the Logging Middleware
 * =============================================================
 *
 * Strict TypeScript type definitions for all logging operations.
 * Uses union types to enforce valid values at compile time.
 */

// ─── Stack Types ────────────────────────────────────────────
/** Valid application stack identifiers */
export type StackType = "backend" | "frontend";

// ─── Log Level Types ────────────────────────────────────────
/** Log severity levels in ascending order of severity */
export type LevelType = "debug" | "info" | "warn" | "error" | "fatal";

// ─── Package Types ──────────────────────────────────────────
/** Backend-only package names */
export type BackendPackageType =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

/** Frontend-only package names */
export type FrontendPackageType =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

/** Common package names valid for both stacks */
export type CommonPackageType =
  | "auth"
  | "config"
  | "middleware"
  | "utils";

/** All valid package names (union of all categories) */
export type PackageType = BackendPackageType | FrontendPackageType | CommonPackageType;

// ─── Log Entry Interfaces ───────────────────────────────────
/** Raw log payload sent to the API */
export interface LogPayload {
  stack: StackType;
  level: LevelType;
  package: PackageType;
  message: string;
}

/** Formatted log entry with metadata (used internally) */
export interface FormattedLogEntry extends LogPayload {
  timestamp: string;
  environment: string;
  appName: string;
}

// ─── Configuration Interfaces ───────────────────────────────
/** Logger configuration options */
export interface LoggerConfig {
  /** Remote logging API URL */
  apiUrl: string;
  /** Application name for log metadata */
  appName: string;
  /** Current environment (development/staging/production) */
  environment: string;
  /** Request timeout in milliseconds (default: 5000) */
  timeoutMs: number;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Enable console fallback logging (default: true) */
  consoleFallback: boolean;
  /** Enable log batching (default: false) */
  enableBatching: boolean;
  /** Batch size before flushing (default: 10) */
  batchSize: number;
  /** Batch flush interval in ms (default: 5000) */
  batchFlushIntervalMs: number;
}

// ─── Retry Configuration ────────────────────────────────────
/** Configuration for the exponential backoff retry mechanism */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay in milliseconds (doubles with each retry) */
  baseDelayMs: number;
  /** Maximum delay cap in milliseconds */
  maxDelayMs: number;
}

// ─── API Response Types ─────────────────────────────────────
/** Response from the logging API */
export interface LogApiResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
}

// ─── Error Types ────────────────────────────────────────────
/** Custom error class for logging validation failures */
export class LogValidationError extends Error {
  public readonly field: string;
  public readonly value: unknown;

  constructor(field: string, value: unknown, message: string) {
    super(message);
    this.name = "LogValidationError";
    this.field = field;
    this.value = value;
  }
}

/** Custom error class for logging API failures */
export class LogApiError extends Error {
  public readonly statusCode: number;
  public readonly retryAttempts: number;

  constructor(statusCode: number, retryAttempts: number, message: string) {
    super(message);
    this.name = "LogApiError";
    this.statusCode = statusCode;
    this.retryAttempts = retryAttempts;
  }
}
