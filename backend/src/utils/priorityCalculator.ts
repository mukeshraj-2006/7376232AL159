/**
 * Priority Calculator — Notification Priority Scoring
 *
 * Formula: score = (typeWeight * 1_000_000_000_000) + epochTime
 * Placement(3) > Result(2) > Event(1), recency as tiebreaker.
 */

import type { Notification, PrioritizedNotification, NotificationType } from "../types/notification";
import { TYPE_WEIGHTS } from "../types/notification";

/** Converts timestamp string to epoch seconds */
export function timestampToEpoch(timestamp: string): number {
  const date = new Date(timestamp.replace(" ", "T"));
  const epoch = Math.floor(date.getTime() / 1000);
  if (isNaN(epoch)) {
    console.warn(`Invalid timestamp: "${timestamp}", using current time`);
    return Math.floor(Date.now() / 1000);
  }
  return epoch;
}

/** Calculates priority score: typeWeight * 1T + epochTime */
export function calculatePriority(type: NotificationType, epochTime: number): number {
  const typeWeight = TYPE_WEIGHTS[type] || 1;
  return typeWeight * 1_000_000_000_000 + epochTime;
}

/** Adds priority score to a notification */
export function prioritizeNotification(notification: Notification): PrioritizedNotification {
  const typeWeight = TYPE_WEIGHTS[notification.type] || 1;
  const priorityScore = calculatePriority(notification.type, notification.epochTime);
  return { ...notification, priorityScore, typeWeight };
}

/** Batch-prioritizes notifications */
export function prioritizeNotifications(notifications: Notification[]): PrioritizedNotification[] {
  return notifications.map(prioritizeNotification);
}
