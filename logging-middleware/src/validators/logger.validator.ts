/**
 * =============================================================
 * Logger Validator — Input Validation for Log Parameters
 * =============================================================
 *
 * Validates all log parameters before sending to the API.
 * Throws descriptive errors with field name and invalid value
 * to aid debugging.
 */

import type {
  StackType,
  LevelType,
  PackageType,
} from "../types/logger.types";
import { LogValidationError } from "../types/logger.types";
import {
  VALID_STACKS,
  VALID_LEVELS,
  STACK_PACKAGE_MAP,
  MIN_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
} from "../config/constants";

/**
 * Validates the stack parameter.
 * Must be a lowercase string matching one of the valid stack types.
 *
 * @param stack - The stack value to validate
 * @throws LogValidationError if stack is invalid
 */
export function validateStack(stack: string): asserts stack is StackType {
  if (!stack || typeof stack !== "string") {
    throw new LogValidationError(
      "stack",
      stack,
      `Invalid stack: received ${typeof stack}, expected one of [${VALID_STACKS.join(", ")}]`
    );
  }

  // Check for incorrect casing
  if (stack !== stack.toLowerCase()) {
    throw new LogValidationError(
      "stack",
      stack,
      `Invalid stack casing: "${stack}" must be lowercase. Use "${stack.toLowerCase()}" instead`
    );
  }

  if (!VALID_STACKS.includes(stack as StackType)) {
    throw new LogValidationError(
      "stack",
      stack,
      `Invalid stack: "${stack}" is not a valid stack. Valid stacks: [${VALID_STACKS.join(", ")}]`
    );
  }
}

/**
 * Validates the log level parameter.
 * Must be a lowercase string matching one of the valid levels.
 *
 * @param level - The level value to validate
 * @throws LogValidationError if level is invalid
 */
export function validateLevel(level: string): asserts level is LevelType {
  if (!level || typeof level !== "string") {
    throw new LogValidationError(
      "level",
      level,
      `Invalid level: received ${typeof level}, expected one of [${VALID_LEVELS.join(", ")}]`
    );
  }

  // Check for incorrect casing
  if (level !== level.toLowerCase()) {
    throw new LogValidationError(
      "level",
      level,
      `Invalid level casing: "${level}" must be lowercase. Use "${level.toLowerCase()}" instead`
    );
  }

  if (!VALID_LEVELS.includes(level as LevelType)) {
    throw new LogValidationError(
      "level",
      level,
      `Invalid level: "${level}" is not a valid level. Valid levels: [${VALID_LEVELS.join(", ")}]`
    );
  }
}

/**
 * Validates the package name parameter.
 * Must be a lowercase string that is valid for the given stack.
 * Backend has backend-only + common packages.
 * Frontend has frontend-only + common packages.
 *
 * @param stack - The validated stack (used to determine valid packages)
 * @param packageName - The package name to validate
 * @throws LogValidationError if package is invalid for the given stack
 */
export function validatePackage(
  stack: StackType,
  packageName: string
): asserts packageName is PackageType {
  if (!packageName || typeof packageName !== "string") {
    throw new LogValidationError(
      "package",
      packageName,
      `Invalid package: received ${typeof packageName}, expected a valid package name string`
    );
  }

  // Check for incorrect casing
  if (packageName !== packageName.toLowerCase()) {
    throw new LogValidationError(
      "package",
      packageName,
      `Invalid package casing: "${packageName}" must be lowercase. Use "${packageName.toLowerCase()}" instead`
    );
  }

  const validPackages = STACK_PACKAGE_MAP[stack];
  if (!validPackages.includes(packageName)) {
    throw new LogValidationError(
      "package",
      packageName,
      `Invalid package: "${packageName}" is not valid for stack "${stack}". ` +
      `Valid packages for ${stack}: [${validPackages.join(", ")}]`
    );
  }
}

/**
 * Validates the log message parameter.
 * Must be a non-empty string within the allowed length bounds.
 *
 * @param message - The message string to validate
 * @throws LogValidationError if message is invalid
 */
export function validateMessage(message: string): void {
  if (message === undefined || message === null) {
    throw new LogValidationError(
      "message",
      message,
      `Invalid message: message is required and cannot be ${message}`
    );
  }

  if (typeof message !== "string") {
    throw new LogValidationError(
      "message",
      message,
      `Invalid message: received ${typeof message}, expected string`
    );
  }

  const trimmed = message.trim();
  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    throw new LogValidationError(
      "message",
      message,
      `Invalid message: message cannot be empty. Minimum length: ${MIN_MESSAGE_LENGTH} character(s)`
    );
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new LogValidationError(
      "message",
      message,
      `Invalid message: message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters. ` +
      `Received: ${trimmed.length} characters`
    );
  }
}

/**
 * Validates all log parameters in a single call.
 * Runs all individual validators sequentially.
 *
 * @param stack - The stack identifier
 * @param level - The log severity level
 * @param packageName - The package/module name
 * @param message - The log message
 * @throws LogValidationError if any parameter is invalid
 */
export function validateLogParams(
  stack: string,
  level: string,
  packageName: string,
  message: string
): void {
  validateStack(stack);
  validateLevel(level);
  validatePackage(stack, packageName);
  validateMessage(message);
}
