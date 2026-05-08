/**
 * =============================================================
 * Formatter Utility Tests — Unit Tests
 * =============================================================
 *
 * Tests for log formatting and payload creation.
 */

import { describe, it, expect } from "vitest";
import {
  createLogPayload,
  createFormattedEntry,
  formatConsoleOutput,
  formatJsonOutput,
} from "../utils/formatter";

// ─── createLogPayload Tests ─────────────────────────────────
describe("createLogPayload", () => {
  it("should create a valid log payload", () => {
    const payload = createLogPayload(
      "backend",
      "error",
      "handler",
      "Test message"
    );

    expect(payload).toEqual({
      stack: "backend",
      level: "error",
      package: "handler",
      message: "Test message",
    });
  });

  it("should trim message whitespace", () => {
    const payload = createLogPayload(
      "frontend",
      "info",
      "component",
      "  padded message  "
    );

    expect(payload.message).toBe("padded message");
  });
});

// ─── createFormattedEntry Tests ─────────────────────────────
describe("createFormattedEntry", () => {
  it("should create entry with metadata", () => {
    const entry = createFormattedEntry(
      "backend",
      "info",
      "service",
      "Test message",
      "test-app",
      "test"
    );

    expect(entry.stack).toBe("backend");
    expect(entry.level).toBe("info");
    expect(entry.package).toBe("service");
    expect(entry.message).toBe("Test message");
    expect(entry.appName).toBe("test-app");
    expect(entry.environment).toBe("test");
    expect(entry.timestamp).toBeDefined();
    // Verify timestamp is valid ISO string
    expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
  });
});

// ─── formatConsoleOutput Tests ──────────────────────────────
describe("formatConsoleOutput", () => {
  it("should format output with level and stack info", () => {
    const entry = createFormattedEntry(
      "backend",
      "error",
      "handler",
      "Test error"
    );

    const output = formatConsoleOutput(entry);

    expect(output).toContain("ERROR");
    expect(output).toContain("backend:handler");
    expect(output).toContain("Test error");
  });
});

// ─── formatJsonOutput Tests ─────────────────────────────────
describe("formatJsonOutput", () => {
  it("should return valid JSON string", () => {
    const entry = createFormattedEntry(
      "frontend",
      "debug",
      "state",
      "State updated"
    );

    const jsonStr = formatJsonOutput(entry);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.stack).toBe("frontend");
    expect(parsed.level).toBe("debug");
    expect(parsed.package).toBe("state");
    expect(parsed.message).toBe("State updated");
  });
});
