/**
 * =============================================================
 * Retry Utility Tests — Unit Tests
 * =============================================================
 *
 * Tests for the exponential backoff retry mechanism.
 */

import { describe, it, expect, vi } from "vitest";
import { calculateBackoffDelay, withRetry } from "../utils/retry";

// ─── Backoff Delay Calculation Tests ────────────────────────
describe("calculateBackoffDelay", () => {
  it("should return ~500ms for first attempt", () => {
    const delay = calculateBackoffDelay(0, {
      maxRetries: 3,
      baseDelayMs: 500,
      maxDelayMs: 5000,
    });
    // 500ms base + 0-100ms jitter
    expect(delay).toBeGreaterThanOrEqual(500);
    expect(delay).toBeLessThanOrEqual(600);
  });

  it("should return ~1000ms for second attempt", () => {
    const delay = calculateBackoffDelay(1, {
      maxRetries: 3,
      baseDelayMs: 500,
      maxDelayMs: 5000,
    });
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(1100);
  });

  it("should return ~2000ms for third attempt", () => {
    const delay = calculateBackoffDelay(2, {
      maxRetries: 3,
      baseDelayMs: 500,
      maxDelayMs: 5000,
    });
    expect(delay).toBeGreaterThanOrEqual(2000);
    expect(delay).toBeLessThanOrEqual(2100);
  });

  it("should cap delay at maxDelayMs", () => {
    const delay = calculateBackoffDelay(10, {
      maxRetries: 3,
      baseDelayMs: 500,
      maxDelayMs: 5000,
    });
    expect(delay).toBeLessThanOrEqual(5100); // 5000 + max jitter
  });
});

// ─── withRetry Tests ────────────────────────────────────────
describe("withRetry", () => {
  it("should return result on first success", async () => {
    const operation = vi.fn().mockResolvedValue("success");

    const result = await withRetry(operation, {
      maxRetries: 3,
      baseDelayMs: 10, // Fast for testing
      maxDelayMs: 50,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and succeed", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("success");

    const result = await withRetry(operation, {
      maxRetries: 3,
      baseDelayMs: 10,
      maxDelayMs: 50,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("should throw after all retries exhausted", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("persistent failure"));

    await expect(
      withRetry(operation, {
        maxRetries: 2,
        baseDelayMs: 10,
        maxDelayMs: 50,
      })
    ).rejects.toThrow("persistent failure");

    // Initial + 2 retries = 3 total attempts
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("should call onRetry callback on each retry", async () => {
    const onRetry = vi.fn();
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("success");

    await withRetry(
      operation,
      { maxRetries: 3, baseDelayMs: 10, maxDelayMs: 50 },
      onRetry
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });
});
