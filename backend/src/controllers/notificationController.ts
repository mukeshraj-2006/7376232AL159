/**
 * Notification Controller — Request handlers for notification endpoints
 */

import { Request, Response } from "express";
import {
  fetchNotifications,
  getTopNotifications,
  loadIntoHeap,
  markAsRead,
  getHeapStats,
} from "../services/notificationService";
import { prioritizeNotifications } from "../utils/priorityCalculator";
import type { NotificationType } from "../types/notification";
import { VALID_NOTIFICATION_TYPES } from "../types/notification";

/**
 * GET /api/notifications
 * Returns paginated, filterable notifications with priority scores.
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const typeFilter = req.query.notification_type as string | undefined;

    // Validate type filter
    if (typeFilter && !VALID_NOTIFICATION_TYPES.includes(typeFilter as NotificationType)) {
      res.status(400).json({
        error: `Invalid notification_type. Valid types: ${VALID_NOTIFICATION_TYPES.join(", ")}`,
      });
      return;
    }

    const notifications = await fetchNotifications({
      page,
      limit,
      notification_type: typeFilter as NotificationType | undefined,
    });

    const prioritized = prioritizeNotifications(notifications);

    // Sort by priority score descending
    prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

    // Load into heap for priority inbox
    for (const n of notifications) {
      await loadIntoHeap({ page: 1, limit: 1 }).catch(() => {});
    }

    res.json({
      notifications: prioritized,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: prioritized.length,
        totalPages: Math.ceil(prioritized.length / limit) || 1,
        hasNextPage: true, // External API may have more
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Controller] getNotifications failed: ${message}`);
    res.status(500).json({ error: "Failed to fetch notifications", details: message });
  }
}

/**
 * GET /api/notifications/priority
 * Returns top N priority notifications from the heap.
 */
export async function getPriorityNotifications(req: Request, res: Response): Promise<void> {
  try {
    const n = Math.min(100, Math.max(1, parseInt(req.query.n as string) || 10));

    // Load notifications into heap from multiple types
    await Promise.all([
      loadIntoHeap({ page: 1, limit: 50, notification_type: "Placement" }),
      loadIntoHeap({ page: 1, limit: 50, notification_type: "Result" }),
      loadIntoHeap({ page: 1, limit: 50, notification_type: "Event" }),
    ]);

    const topNotifications = getTopNotifications(n);
    const stats = getHeapStats();

    res.json({
      topNotifications,
      count: topNotifications.length,
      heapSize: stats.size,
      heapCapacity: stats.capacity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Controller] getPriorityNotifications failed: ${message}`);
    res.status(500).json({ error: "Failed to get priority notifications", details: message });
  }
}

/**
 * GET /api/notifications/types
 * Returns available notification types.
 */
export function getNotificationTypes(_req: Request, res: Response): void {
  res.json({ types: VALID_NOTIFICATION_TYPES });
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a notification as read.
 */
export function markNotificationRead(req: Request, res: Response): void {
  const id = req.params.id as string;
  if (!id) {
    res.status(400).json({ error: "Notification ID is required" });
    return;
  }
  markAsRead(id);
  res.json({ success: true, message: `Notification ${id} marked as read` });
}

/**
 * GET /api/notifications/stats
 * Returns heap statistics.
 */
export function getStats(_req: Request, res: Response): void {
  const stats = getHeapStats();
  res.json(stats);
}
