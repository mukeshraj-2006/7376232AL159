/**
 * Backend Server Entry Point
 * Express server with CORS, logging middleware, and notification routes.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { config } from "./config";
import { loggingMiddleware, errorLoggingMiddleware } from "./middleware/logger";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app = express();

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(loggingMiddleware);

// ─── Routes ─────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use("/api/notifications", notificationRoutes);

// ─── Error Handling ─────────────────────────────────────────
app.use(errorLoggingMiddleware);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Start Server ───────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🚀 Campus Notifications Backend`);
  console.log(`   Server running on http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   API Base: ${config.notificationApiUrl}`);
  console.log(`   Heap Capacity: ${config.defaultHeapCapacity}\n`);
});

export default app;
