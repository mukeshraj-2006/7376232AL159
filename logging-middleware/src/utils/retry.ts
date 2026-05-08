/**
 * =============================================================
 * Retry Utility — Exponential Backoff Retry Mechanism
 * =============================================================
 *
 * Implements retry logic with exponential backoff for API calls.
 * Retries: 500ms → 1000ms → 2000ms (doubles each time).
 * Adds jitter to prevent thundering herd problem.
 */

import type { RetryConfig } from "../types/logger.types";
import { DEFAULT_RETRY_CONFIG } from "../config/constants";

/**
 * Calculates the delay for a given retry attempt using exponential backoff.
 * Adds a small random jitter (0-100ms) to prevent synchronized retries.
 *
 * @param attempt - The current retry attempt number (0-indexed)
 * @param config - Retry configuration with base delay and max delay
 * @returns The delay in milliseconds before the next retry
 *
 * @example
 * calculateBackoffDelay(0) => ~500ms
 * calculateBackoffDelay(1) => ~1000ms
 * calculateBackoffDelay(2) => ~2000ms
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);

  // Cap at maximum delay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  // Add jitter (0-100ms) to prevent thundering herd
  const jitter = Math.random() * 100;

  return cappedDelay + jitter;
}

/**
 * Sleeps for the specified duration.
 * Used between retry attempts.
 *
 * @param ms - Duration in milliseconds
 * @returns A promise that resolves after the specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async operation with automatic retry using exponential backoff.
 * If all retry attempts fail, throws the last encountered error.
 *
 * @param operation - The async function to execute
 * @param config - Retry configuration (defaults to DEFAULT_RETRY_CONFIG)
 * @param onRetry - Optional callback invoked on each retry attempt
 * @returns The result of the successful operation
 * @throws The last error if all retry attempts are exhausted
 *
 * @example
 * const result = await withRetry(
 *   () => sendLogToApi(payload),
 *   { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 5000 },
 *   (attempt, error) => console.warn(`Retry ${attempt}: ${error.message}`)
 * );
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error = new Error("Retry operation failed");

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, don't retry
      if (attempt >= config.maxRetries) {
        break;
      }

      // Calculate backoff delay and wait
      const delay = calculateBackoffDelay(attempt, config);

      // Invoke retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}
