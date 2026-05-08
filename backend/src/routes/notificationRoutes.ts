/**
 * Notification Routes — Express router for notification endpoints
 */

import { Router } from "express";
import {
  getNotifications,
  getPriorityNotifications,
  getNotificationTypes,
  markNotificationRead,
  getStats,
} from "../controllers/notificationController";

const router = Router();

// GET /api/notifications — Paginated, filterable notifications
router.get("/", getNotifications);

// GET /api/notifications/priority — Top N priority notifications
router.get("/priority", getPriorityNotifications);

// GET /api/notifications/types — Available notification types
router.get("/types", getNotificationTypes);

// GET /api/notifications/stats — Heap statistics
router.get("/stats", getStats);

// PATCH /api/notifications/:id/read — Mark notification as read
router.patch("/:id/read", markNotificationRead);

export default router;
