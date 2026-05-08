/**
 * =============================================================
 * Frontend Usage Examples — Logging Middleware
 * =============================================================
 *
 * Demonstrates how to use the logging middleware in a
 * React/Next.js frontend application.
 *
 * Run: npx ts-node src/examples/frontend.example.ts
 */

import { Log, configure } from "../index";

// ─── Configure logger for frontend usage ────────────────────
configure({
  appName: "campus-notifications-frontend",
  environment: "development",
  consoleFallback: true,
  maxRetries: 2, // Fewer retries for frontend (user-facing)
  timeoutMs: 3000, // Shorter timeout for frontend responsiveness
});

/**
 * Demonstrates various frontend logging scenarios.
 */
async function runFrontendExamples(): Promise<void> {
  console.log("=== Frontend Logging Examples ===\n");

  // ─── Component Layer Logs ───────────────────────────────
  console.log("1. Component - render success:");
  await Log(
    "frontend",
    "info",
    "component",
    "NotificationCard rendered successfully with 25 notification items"
  );

  console.log("\n2. Component - render error:");
  await Log(
    "frontend",
    "error",
    "component",
    "NotificationCard failed to render: invalid notification data structure received"
  );

  // ─── API Layer Logs ─────────────────────────────────────
  console.log("\n3. API - fetch success:");
  await Log(
    "frontend",
    "info",
    "api",
    "Successfully fetched 20 notifications from /api/notifications?page=1&limit=20"
  );

  console.log("\n4. API - fetch failure:");
  await Log(
    "frontend",
    "error",
    "api",
    "Failed to fetch notifications from backend API after 3 retries: Network Error"
  );

  // ─── State Layer Logs ───────────────────────────────────
  console.log("\n5. State - context update:");
  await Log(
    "frontend",
    "debug",
    "state",
    "NotificationContext updated: totalCount=150, filteredCount=45, currentPage=2"
  );

  console.log("\n6. State - priority inbox:");
  await Log(
    "frontend",
    "info",
    "state",
    "Priority inbox state refreshed with top 10 notifications"
  );

  // ─── Page Layer Logs ────────────────────────────────────
  console.log("\n7. Page - navigation:");
  await Log(
    "frontend",
    "info",
    "page",
    "User navigated to /priority-inbox page"
  );

  console.log("\n8. Page - load error:");
  await Log(
    "frontend",
    "error",
    "page",
    "NotificationsPage failed to load: API returned 500 Internal Server Error"
  );

  // ─── Hook Layer Logs ────────────────────────────────────
  console.log("\n9. Hook - data fetching:");
  await Log(
    "frontend",
    "debug",
    "hook",
    "useNotifications hook triggered with params: type=Placement, page=1, limit=20"
  );

  // ─── Style Layer Logs ───────────────────────────────────
  console.log("\n10. Style - theme:");
  await Log(
    "frontend",
    "debug",
    "style",
    "Theme switched to dark mode — recalculating notification card contrast ratios"
  );

  // ─── Middleware Layer Logs ──────────────────────────────
  console.log("\n11. Middleware - request interceptor:");
  await Log(
    "frontend",
    "info",
    "middleware",
    "Axios request interceptor attached: adding auth headers to all API calls"
  );

  // ─── Auth Layer Logs ────────────────────────────────────
  console.log("\n12. Auth - session:");
  await Log(
    "frontend",
    "warn",
    "auth",
    "User session token expires in 5 minutes — triggering refresh"
  );

  // ─── Config Layer Logs ──────────────────────────────────
  console.log("\n13. Config - environment:");
  await Log(
    "frontend",
    "info",
    "config",
    "Frontend configured: API_BASE_URL=http://localhost:5000, environment=development"
  );

  // ─── Utils Layer Logs ───────────────────────────────────
  console.log("\n14. Utils - formatting:");
  await Log(
    "frontend",
    "debug",
    "utils",
    "Formatted timestamp '2026-04-22 17:51:30' to relative time '2 weeks ago'"
  );

  console.log("\n=== Frontend Examples Complete ===");
}

// Execute examples
runFrontendExamples().catch(console.error);
