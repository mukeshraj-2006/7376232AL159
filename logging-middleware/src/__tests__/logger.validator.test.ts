/**
 * =============================================================
 * Logger Validator Tests — Unit Tests
 * =============================================================
 *
 * Tests for input validation logic covering:
 * - Valid inputs pass
 * - Invalid stack/level/package/message throws descriptive errors
 * - Casing validation
 * - Stack-package mapping validation
 */

import { describe, it, expect } from "vitest";
import {
  validateStack,
  validateLevel,
  validatePackage,
  validateMessage,
  validateLogParams,
} from "../validators/logger.validator";
import { LogValidationError } from "../types/logger.types";

// ─── Stack Validation Tests ─────────────────────────────────
describe("validateStack", () => {
  it("should accept valid stacks", () => {
    expect(() => validateStack("backend")).not.toThrow();
    expect(() => validateStack("frontend")).not.toThrow();
  });

  it("should reject invalid stack values", () => {
    expect(() => validateStack("mobile")).toThrow(LogValidationError);
    expect(() => validateStack("fullstack")).toThrow(LogValidationError);
  });

  it("should reject incorrect casing", () => {
    expect(() => validateStack("Backend")).toThrow(/must be lowercase/);
    expect(() => validateStack("FRONTEND")).toThrow(/must be lowercase/);
  });

  it("should reject empty/null/undefined stacks", () => {
    expect(() => validateStack("")).toThrow(LogValidationError);
    expect(() => validateStack(null as unknown as string)).toThrow(LogValidationError);
    expect(() => validateStack(undefined as unknown as string)).toThrow(LogValidationError);
  });
});

// ─── Level Validation Tests ─────────────────────────────────
describe("validateLevel", () => {
  it("should accept all valid levels", () => {
    const validLevels = ["debug", "info", "warn", "error", "fatal"];
    validLevels.forEach((level) => {
      expect(() => validateLevel(level)).not.toThrow();
    });
  });

  it("should reject invalid levels", () => {
    expect(() => validateLevel("critical")).toThrow(LogValidationError);
    expect(() => validateLevel("verbose")).toThrow(LogValidationError);
    expect(() => validateLevel("trace")).toThrow(LogValidationError);
  });

  it("should reject incorrect casing", () => {
    expect(() => validateLevel("ERROR")).toThrow(/must be lowercase/);
    expect(() => validateLevel("Info")).toThrow(/must be lowercase/);
  });
});

// ─── Package Validation Tests ───────────────────────────────
describe("validatePackage", () => {
  it("should accept valid backend packages", () => {
    const backendPackages = [
      "cache", "controller", "cron_job", "db", "domain",
      "handler", "repository", "route", "service",
    ];
    backendPackages.forEach((pkg) => {
      expect(() => validatePackage("backend", pkg)).not.toThrow();
    });
  });

  it("should accept valid frontend packages", () => {
    const frontendPackages = [
      "api", "component", "hook", "page", "state", "style",
    ];
    frontendPackages.forEach((pkg) => {
      expect(() => validatePackage("frontend", pkg)).not.toThrow();
    });
  });

  it("should accept common packages for both stacks", () => {
    const commonPackages = ["auth", "config", "middleware", "utils"];
    commonPackages.forEach((pkg) => {
      expect(() => validatePackage("backend", pkg)).not.toThrow();
      expect(() => validatePackage("frontend", pkg)).not.toThrow();
    });
  });

  it("should reject frontend packages used with backend stack", () => {
    expect(() => validatePackage("backend", "component")).toThrow(LogValidationError);
    expect(() => validatePackage("backend", "hook")).toThrow(LogValidationError);
    expect(() => validatePackage("backend", "page")).toThrow(LogValidationError);
  });

  it("should reject backend packages used with frontend stack", () => {
    expect(() => validatePackage("frontend", "controller")).toThrow(LogValidationError);
    expect(() => validatePackage("frontend", "db")).toThrow(LogValidationError);
    expect(() => validatePackage("frontend", "repository")).toThrow(LogValidationError);
  });

  it("should reject incorrect casing", () => {
    expect(() => validatePackage("backend", "Controller")).toThrow(/must be lowercase/);
  });
});

// ─── Message Validation Tests ───────────────────────────────
describe("validateMessage", () => {
  it("should accept valid messages", () => {
    expect(() => validateMessage("Valid log message")).not.toThrow();
    expect(() => validateMessage("A")).not.toThrow();
  });

  it("should reject empty messages", () => {
    expect(() => validateMessage("")).toThrow(LogValidationError);
    expect(() => validateMessage("   ")).toThrow(LogValidationError);
  });

  it("should reject null/undefined messages", () => {
    expect(() => validateMessage(null as unknown as string)).toThrow(LogValidationError);
    expect(() => validateMessage(undefined as unknown as string)).toThrow(LogValidationError);
  });

  it("should reject messages exceeding max length", () => {
    const longMessage = "a".repeat(2001);
    expect(() => validateMessage(longMessage)).toThrow(/exceeds maximum length/);
  });

  it("should accept messages at max length", () => {
    const maxMessage = "a".repeat(2000);
    expect(() => validateMessage(maxMessage)).not.toThrow();
  });
});

// ─── Combined Validation Tests ──────────────────────────────
describe("validateLogParams", () => {
  it("should accept fully valid parameters", () => {
    expect(() =>
      validateLogParams("backend", "info", "service", "Test message")
    ).not.toThrow();

    expect(() =>
      validateLogParams("frontend", "error", "api", "API call failed")
    ).not.toThrow();
  });

  it("should reject on first invalid parameter", () => {
    expect(() =>
      validateLogParams("invalid", "info", "service", "Test")
    ).toThrow(LogValidationError);
  });
});
