/**
 * =============================================================
 * Logging Middleware — Public API Entry Point
 * =============================================================
 *
 * This is the main entry point for the logging middleware package.
 * It re-exports all public APIs needed by consumers.
 *
 * Usage:
 *   import { Log, configure } from "@campus-notify/logging-middleware";
 *
 *   await Log("backend", "info", "service", "Fetched 50 notifications");
 */

// ─── Core Log Function ─────────────────────────────────────
export { Log, configure, getConfig, flush, shutdown } from "./services/logger.service";

// ─── Type Exports ───────────────────────────────────────────
export type {
  StackType,
  LevelType,
  PackageType,
  BackendPackageType,
  FrontendPackageType,
  CommonPackageType,
  LogPayload,
  FormattedLogEntry,
  LoggerConfig,
  RetryConfig,
  LogApiResponse,
} from "./types/logger.types";

export { LogValidationError, LogApiError } from "./types/logger.types";

// ─── Validators (for advanced usage) ────────────────────────
export {
  validateStack,
  validateLevel,
  validatePackage,
  validateMessage,
  validateLogParams,
} from "./validators/logger.validator";

// ─── Utilities (for advanced usage) ─────────────────────────
export { withRetry, calculateBackoffDelay, sleep } from "./utils/retry";
export { createTimeoutSignal, withTimeout } from "./utils/timeout";
export {
  createLogPayload,
  createFormattedEntry,
  formatConsoleOutput,
  formatJsonOutput,
} from "./utils/formatter";

// ─── Constants (for reference) ──────────────────────────────
export {
  VALID_STACKS,
  VALID_LEVELS,
  BACKEND_PACKAGES,
  FRONTEND_PACKAGES,
  COMMON_PACKAGES,
  STACK_PACKAGE_MAP,
} from "./config/constants";
