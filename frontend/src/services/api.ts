/** API Service — Axios-based API abstraction layer */

import axios from "axios";
import type { NotificationResponse, PriorityInboxResponse, NotificationType } from "../types/notification";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/** Fetch paginated notifications with optional type filter */
export async function fetchNotifications(
  page: number = 1,
  limit: number = 20,
  notificationType?: NotificationType
): Promise<NotificationResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (notificationType) params.notification_type = notificationType;

  const { data } = await apiClient.get<NotificationResponse>("/notifications", { params });
  return data;
}

/** Fetch top N priority notifications */
export async function fetchPriorityNotifications(n: number = 10): Promise<PriorityInboxResponse> {
  const { data } = await apiClient.get<PriorityInboxResponse>("/notifications/priority", {
    params: { n },
  });
  return data;
}

/** Mark a notification as read */
export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

/** Fetch available notification types */
export async function fetchNotificationTypes(): Promise<string[]> {
  const { data } = await apiClient.get<{ types: string[] }>("/notifications/types");
  return data.types;
}

/** Health check */
export async function healthCheck(): Promise<boolean> {
  try {
    await apiClient.get("/health");
    return true;
  } catch {
    return false;
  }
}
