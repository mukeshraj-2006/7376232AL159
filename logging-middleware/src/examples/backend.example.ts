/**
 * =============================================================
 * Backend Usage Examples — Logging Middleware
 * =============================================================
 *
 * Demonstrates how to use the logging middleware in a
 * Node.js/Express backend application.
 *
 * Run: npx ts-node src/examples/backend.example.ts
 */

import { Log, configure } from "../index";

// ─── Configure logger for backend usage ─────────────────────
configure({
  appName: "campus-notifications-backend",
  environment: "development",
  consoleFallback: true,
  maxRetries: 3,
  timeoutMs: 5000,
});

/**
 * Demonstrates various backend logging scenarios.
 */
async function runBackendExamples(): Promise<void> {
  console.log("=== Backend Logging Examples ===\n");

  // ─── Service Layer Logs ─────────────────────────────────
  console.log("1. Service layer - successful operation:");
  await Log(
    "backend",
    "info",
    "service",
    "Fetched 50 notifications from external API successfully"
  );

  console.log("\n2. Service layer - warning:");
  await Log(
    "backend",
    "warn",
    "service",
    "External notification API responded with partial data (30/50 notifications)"
  );

  // ─── Controller Layer Logs ──────────────────────────────
  console.log("\n3. Controller - request handling:");
  await Log(
    "backend",
    "info",
    "controller",
    "GET /api/notifications processed in 120ms with 25 results"
  );

  // ─── Handler Layer Logs ─────────────────────────────────
  console.log("\n4. Handler - error scenario:");
  await Log(
    "backend",
    "error",
    "handler",
    "Priority heap insertion failed: invalid timestamp format in notification ID abc-123"
  );

  // ─── Middleware Layer Logs ──────────────────────────────
  console.log("\n5. Middleware - authentication:");
  await Log(
    "backend",
    "warn",
    "middleware",
    "JWT token missing from request headers for route GET /api/notifications/priority"
  );

  console.log("\n6. Middleware - request logging:");
  await Log(
    "backend",
    "info",
    "middleware",
    "Incoming request: GET /api/notifications?page=1&limit=20&type=Placement"
  );

  // ─── Cache Layer Logs ───────────────────────────────────
  console.log("\n7. Cache - hit/miss:");
  await Log(
    "backend",
    "debug",
    "cache",
    "Cache miss for key 'notifications:page:1:limit:20' — fetching from API"
  );

  // ─── Route Layer Logs ───────────────────────────────────
  console.log("\n8. Route - registration:");
  await Log(
    "backend",
    "info",
    "route",
    "Registered 4 notification API routes on /api/notifications"
  );

  // ─── Database Layer Logs ────────────────────────────────
  console.log("\n9. Database - connection (even though we don't use DB):");
  await Log(
    "backend",
    "error",
    "db",
    "Database connection timeout after 5 seconds — operation aborted"
  );

  // ─── Fatal Error ────────────────────────────────────────
  console.log("\n10. Fatal - system crash:");
  await Log(
    "backend",
    "fatal",
    "service",
    "Unhandled exception in notification processing pipeline — shutting down gracefully"
  );

  // ─── Config Logs ────────────────────────────────────────
  console.log("\n11. Config - startup:");
  await Log(
    "backend",
    "info",
    "config",
    "Server configuration loaded: port=5000, env=development, heap_capacity=100"
  );

  // ─── Utils Logs ─────────────────────────────────────────
  console.log("\n12. Utils - priority calculation:");
  await Log(
    "backend",
    "debug",
    "utils",
    "Priority score calculated: type=Placement, weight=3, recency=1715155200, score=3001715155200"
  );

  console.log("\n=== Backend Examples Complete ===");
}

// Execute examples
runBackendExamples().catch(console.error);
