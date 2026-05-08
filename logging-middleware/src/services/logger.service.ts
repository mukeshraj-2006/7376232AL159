/**
 * =============================================================
 * Logger Service — Core Logging Engine
 * =============================================================
 *
 * The central logging service that orchestrates validation,
 * formatting, retry logic, timeout handling, and API communication.
 *
 * Supports:
 * - Single log dispatch with retry + timeout
 * - Log batching for high-throughput scenarios
 * - Console fallback when API is unreachable
 * - Configurable via LoggerConfig
 */

import axios, { AxiosError } from "axios";
import type {
  StackType,
  LevelType,
  PackageType,
  LoggerConfig,
  LogPayload,
  FormattedLogEntry,
} from "../types/logger.types";
import { LogApiError } from "../types/logger.types";
import { validateLogParams } from "../validators/logger.validator";
import { createLogPayload, createFormattedEntry, formatConsoleOutput } from "../utils/formatter";
import { withRetry } from "../utils/retry";
import { createTimeoutSignal } from "../utils/timeout";
import {
  DEFAULT_LOGGER_CONFIG,
  DEFAULT_RETRY_CONFIG,
  LOG_API_HEADERS,
} from "../config/constants";

// ─── Internal State ─────────────────────────────────────────
/** Current logger configuration (mutable via configure()) */
let currentConfig: LoggerConfig = { ...DEFAULT_LOGGER_CONFIG };

/** Internal batch queue for buffered log dispatch */
let logBatchQueue: LogPayload[] = [];

/** Batch flush timer reference */
let batchTimerId: ReturnType<typeof setInterval> | null = null;

// ─── Configuration ──────────────────────────────────────────
/**
 * Configures the logger with custom settings.
 * Merges provided options with default configuration.
 *
 * @param config - Partial configuration to merge with defaults
 *
 * @example
 * configure({
 *   apiUrl: "https://custom-logging-server.com/logs",
 *   appName: "my-app",
 *   maxRetries: 5,
 * });
 */
export function configure(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };

  // Restart batch timer if batching config changed
  if (currentConfig.enableBatching && !batchTimerId) {
    startBatchTimer();
  } else if (!currentConfig.enableBatching && batchTimerId) {
    stopBatchTimer();
  }
}

/**
 * Returns the current logger configuration.
 * Useful for debugging and testing.
 */
export function getConfig(): Readonly<LoggerConfig> {
  return { ...currentConfig };
}

// ─── Core Log Function ──────────────────────────────────────
/**
 * Sends a log entry to the remote logging API.
 *
 * This is the primary function of the logging middleware.
 * It validates inputs, formats the payload, and sends it to the
 * configured API endpoint with retry and timeout support.
 *
 * @param stack - The application stack ("backend" | "frontend")
 * @param level - Log severity level ("debug" | "info" | "warn" | "error" | "fatal")
 * @param packageName - The package/module generating the log
 * @param message - Descriptive, contextual log message
 *
 * @throws LogValidationError if any parameter is invalid
 *
 * @example
 * await Log("backend", "error", "service", "Failed to fetch notifications after 3 retries");
 * await Log("frontend", "info", "component", "NotificationCard rendered with 25 items");
 */
export async function Log(
  stack: StackType,
  level: LevelType,
  packageName: PackageType,
  message: string
): Promise<void> {
  // Step 1: Validate all parameters
  validateLogParams(stack, level, packageName, message);

  // Step 2: Create the API payload
  const payload = createLogPayload(stack, level, packageName, message);

  // Step 3: Create formatted entry for console fallback
  const formattedEntry = createFormattedEntry(
    stack,
    level,
    packageName,
    message,
    currentConfig.appName,
    currentConfig.environment
  );

  // Step 4: If batching is enabled, queue the log
  if (currentConfig.enableBatching) {
    enqueuLog(payload);
    logToConsole(formattedEntry);
    return;
  }

  // Step 5: Send immediately with retry + timeout
  await dispatchLog(payload, formattedEntry);
}

// ─── API Dispatch ───────────────────────────────────────────
/**
 * Dispatches a single log payload to the remote API.
 * Wraps the HTTP call with retry logic and timeout handling.
 *
 * @param payload - The log payload to send
 * @param formattedEntry - Formatted entry for console fallback
 */
async function dispatchLog(
  payload: LogPayload,
  formattedEntry: FormattedLogEntry
): Promise<void> {
  try {
    await withRetry(
      () => sendToApi(payload),
      {
        ...DEFAULT_RETRY_CONFIG,
        maxRetries: currentConfig.maxRetries,
      },
      (attempt, error) => {
        // Log retry attempts to console
        if (currentConfig.consoleFallback) {
          console.warn(
            `[Logger] Retry attempt ${attempt}/${currentConfig.maxRetries} ` +
            `for log dispatch: ${error.message}`
          );
        }
      }
    );
  } catch (error) {
    // All retries exhausted — use console fallback
    handleDispatchFailure(error, formattedEntry);
  }
}

/**
 * Sends the log payload to the remote API with timeout support.
 *
 * @param payload - The log payload to send
 * @throws AxiosError on network/HTTP failures
 * @throws Error on timeout
 */
async function sendToApi(payload: LogPayload): Promise<void> {
  const { signal, cleanup } = createTimeoutSignal(currentConfig.timeoutMs);

  try {
    await axios.post(currentConfig.apiUrl, payload, {
      headers: LOG_API_HEADERS,
      signal,
      timeout: currentConfig.timeoutMs,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status || 0;
      throw new LogApiError(
        statusCode,
        0,
        `Log API request failed with status ${statusCode}: ${error.message}`
      );
    }
    throw error;
  } finally {
    cleanup();
  }
}

// ─── Batch Processing ───────────────────────────────────────
/**
 * Adds a log payload to the batch queue.
 * Flushes automatically when batch size is reached.
 */
function enqueuLog(payload: LogPayload): void {
  logBatchQueue.push(payload);

  if (logBatchQueue.length >= currentConfig.batchSize) {
    flushBatch();
  }
}

/**
 * Flushes all queued logs to the API.
 * Sends each log individually (API doesn't support batch endpoint).
 */
async function flushBatch(): Promise<void> {
  if (logBatchQueue.length === 0) return;

  const batch = [...logBatchQueue];
  logBatchQueue = [];

  const promises = batch.map((payload) =>
    sendToApi(payload).catch((error) => {
      if (currentConfig.consoleFallback) {
        console.error(`[Logger] Batch item dispatch failed: ${error.message}`);
      }
    })
  );

  await Promise.allSettled(promises);
}

/** Starts the periodic batch flush timer */
function startBatchTimer(): void {
  batchTimerId = setInterval(() => {
    flushBatch();
  }, currentConfig.batchFlushIntervalMs);
}

/** Stops the periodic batch flush timer */
function stopBatchTimer(): void {
  if (batchTimerId) {
    clearInterval(batchTimerId);
    batchTimerId = null;
  }
}

/**
 * Manually flushes the batch queue.
 * Call this before application shutdown to ensure no logs are lost.
 */
export async function flush(): Promise<void> {
  await flushBatch();
}

// ─── Fallback & Error Handling ──────────────────────────────
/**
 * Handles dispatch failures by logging to console as fallback.
 * This ensures logs are never completely lost.
 */
function handleDispatchFailure(
  error: unknown,
  formattedEntry: FormattedLogEntry
): void {
  if (!currentConfig.consoleFallback) return;

  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error(
    `[Logger] Failed to send log to API after ${currentConfig.maxRetries} retries: ${errorMessage}`
  );
  console.error(`[Logger] Original log entry (console fallback):`);
  console.error(formatConsoleOutput(formattedEntry));
}

/**
 * Logs a formatted entry to the console.
 * Used when batching is enabled to provide immediate feedback.
 */
function logToConsole(entry: FormattedLogEntry): void {
  if (!currentConfig.consoleFallback) return;
  console.log(formatConsoleOutput(entry));
}

// ─── Cleanup ────────────────────────────────────────────────
/**
 * Shuts down the logger gracefully.
 * Flushes pending batches and stops timers.
 * Call this during application shutdown.
 */
export async function shutdown(): Promise<void> {
  stopBatchTimer();
  await flushBatch();
}
