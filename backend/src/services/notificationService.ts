/**
 * Notification Service — Fetches, normalizes, and manages notifications
 * Uses external API with fallback mock data when API is unavailable.
 */

import axios from "axios";
import { config } from "../config";
import type { RawNotification, Notification, NotificationType, NotificationQueryParams } from "../types/notification";
import { VALID_NOTIFICATION_TYPES } from "../types/notification";
import { timestampToEpoch, prioritizeNotification } from "../utils/priorityCalculator";
import { MinHeap } from "../heap/MinHeap";

// In-memory priority heap
const priorityHeap = new MinHeap(config.defaultHeapCapacity);

// Track read status in-memory
const readStatus = new Map<string, boolean>();

/** Normalizes a raw API notification into our internal format */
function normalizeNotification(raw: RawNotification): Notification {
  const type = VALID_NOTIFICATION_TYPES.includes(raw.Type as NotificationType)
    ? (raw.Type as NotificationType)
    : "Event";

  return {
    id: raw.ID,
    type,
    message: raw.Message,
    timestamp: raw.Timestamp,
    epochTime: timestampToEpoch(raw.Timestamp),
    read: readStatus.get(raw.ID) || false,
  };
}

/** Generates realistic mock notifications when API is unavailable */
function generateMockNotifications(params: NotificationQueryParams): RawNotification[] {
  const types: NotificationType[] = params.notification_type
    ? [params.notification_type]
    : ["Placement", "Result", "Event"];
  const limit = params.limit || 20;
  const page = params.page || 1;
  const mocks: RawNotification[] = [];

  const messages: Record<NotificationType, string[]> = {
    Placement: [
      "Google hiring drive scheduled for May 2026",
      "Amazon SDE internship applications open",
      "Microsoft campus placement results declared",
      "TCS NQT registration deadline approaching",
      "Infosys Power Programmer test next week",
      "Goldman Sachs pre-placement talk on Friday",
      "Flipkart SDE-1 hiring drive announced",
      "Adobe shortlisted candidates notified",
      "Deloitte campus recruitment drive",
      "JP Morgan coding challenge results out",
    ],
    Result: [
      "Mid-semester examination results published",
      "Final semester grades available on portal",
      "Supplementary exam results declared",
      "Lab internal marks updated",
      "Assignment evaluation scores released",
      "Project review grades posted",
      "Semester GPA calculations completed",
      "Revaluation results announced",
      "Practical exam marks uploaded",
      "Course-wise grade distribution published",
    ],
    Event: [
      "Annual tech fest Hackathon 2026 registrations open",
      "Guest lecture by Dr. Smith on AI/ML tomorrow",
      "Cultural fest Resonance dates announced",
      "IEEE workshop on Cloud Computing this Saturday",
      "Sports day celebrations next Monday",
      "Alumni meet scheduled for June 15th",
      "Code jam competition registration closing soon",
      "Department seminar on Blockchain technology",
      "Blood donation camp organized by NSS",
      "Inter-college debate competition finals",
    ],
  };

  for (let i = 0; i < limit; i++) {
    const type = types[i % types.length];
    const typeMessages = messages[type];
    const msgIndex = ((page - 1) * limit + i) % typeMessages.length;
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const ts = date.toISOString().replace("T", " ").substring(0, 19);

    mocks.push({
      ID: `mock-${type.toLowerCase()}-${page}-${i}-${Date.now()}`,
      Type: type,
      Message: typeMessages[msgIndex],
      Timestamp: ts,
    });
  }

  return mocks;
}

/** Fetches notifications from the external API with fallback */
export async function fetchNotifications(params: NotificationQueryParams = {}): Promise<Notification[]> {
  const { page = 1, limit = 20, notification_type } = params;

  try {
    const queryParams: Record<string, string | number> = { page, limit };
    if (notification_type) queryParams.notification_type = notification_type;

    const response = await axios.get(config.notificationApiUrl, {
      params: queryParams,
      timeout: 5000,
    });

    const rawNotifications: RawNotification[] = response.data?.notifications || [];
    console.log(`[NotificationService] Fetched ${rawNotifications.length} notifications from API`);

    return rawNotifications.map(normalizeNotification);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[NotificationService] API unavailable (${errMsg}), using mock data`);

    const mockRaw = generateMockNotifications(params);
    return mockRaw.map(normalizeNotification);
  }
}

/** Inserts a notification into the priority heap. O(log n) */
export function insertNotification(notification: Notification): boolean {
  const prioritized = prioritizeNotification(notification);
  return priorityHeap.insert(prioritized);
}

/** Gets top N priority notifications from the heap */
export function getTopNotifications(n: number) {
  return priorityHeap.getTopNLimited(n);
}

/** Loads notifications into the heap */
export async function loadIntoHeap(params: NotificationQueryParams = {}): Promise<number> {
  const notifications = await fetchNotifications(params);
  let inserted = 0;

  for (const notification of notifications) {
    if (!priorityHeap.contains(notification.id)) {
      const wasInserted = insertNotification(notification);
      if (wasInserted) inserted++;
    }
  }

  console.log(`[NotificationService] Inserted ${inserted}/${notifications.length} into heap (size: ${priorityHeap.size})`);
  return inserted;
}

/** Marks a notification as read */
export function markAsRead(id: string): void {
  readStatus.set(id, true);
}

/** Gets heap statistics */
export function getHeapStats() {
  return { size: priorityHeap.size, capacity: priorityHeap.maxCapacity };
}

/** Clears the heap */
export function clearHeap(): void {
  priorityHeap.clear();
}
