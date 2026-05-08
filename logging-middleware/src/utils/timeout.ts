/**
 * =============================================================
 * Timeout Utility — Request Timeout with AbortController
 * =============================================================
 *
 * Provides timeout functionality using AbortController for
 * cancelling long-running API requests.
 * Default timeout: 5000ms.
 */

import { DEFAULT_TIMEOUT_MS } from "../config/constants";

/**
 * Creates an AbortController that automatically aborts after the specified timeout.
 * Used to enforce request timeouts on fetch/axios calls.
 *
 * @param timeoutMs - Timeout duration in milliseconds (default: 5000)
 * @returns An object containing the AbortController's signal and a cleanup function
 *
 * @example
 * const { signal, cleanup } = createTimeoutSignal(5000);
 * try {
 *   const response = await fetch(url, { signal });
 * } finally {
 *   cleanup(); // Always clean up to prevent memory leaks
 * }
 */
export function createTimeoutSignal(
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(
      new Error(`Log API request timed out after ${timeoutMs}ms`)
    );
  }, timeoutMs);

  const cleanup = (): void => {
    clearTimeout(timeoutId);
  };

  return { signal: controller.signal, cleanup };
}

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve
 * within the specified duration, it rejects with a timeout error.
 *
 * @param promise - The promise to wrap with timeout
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @param operationName - Name of the operation (used in error message)
 * @returns The result of the promise if it resolves in time
 * @throws Error if the promise doesn't resolve within the timeout
 *
 * @example
 * const result = await withTimeout(
 *   sendLogToApi(payload),
 *   5000,
 *   "Log API request"
 * );
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  operationName: string = "Operation"
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `${operationName} timed out after ${timeoutMs}ms. ` +
          `Consider increasing the timeout or checking network connectivity.`
        )
      );
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
