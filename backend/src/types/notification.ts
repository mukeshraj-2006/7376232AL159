/**
 * =============================================================
 * Notification Types — TypeScript Interfaces
 * =============================================================
 */

/** Raw notification from the external API */
export interface RawNotification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

/** API response shape from the external notification API */
export interface NotificationApiResponse {
  notifications: RawNotification[];
}

/** Normalized notification used internally */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  epochTime: number;
  read: boolean;
}

/** Notification with computed priority score */
export interface PrioritizedNotification extends Notification {
  priorityScore: number;
  typeWeight: number;
}

/** Valid notification types */
export type NotificationType = "Placement" | "Result" | "Event";

/** Priority weights for each notification type */
export const TYPE_WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
} as const;

/** Valid notification types array */
export const VALID_NOTIFICATION_TYPES: NotificationType[] = [
  "Placement",
  "Result",
  "Event",
];

/** Query parameters for fetching notifications */
export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  notification_type?: NotificationType;
}

/** Paginated response from our backend API */
export interface PaginatedNotificationResponse {
  notifications: PrioritizedNotification[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/** Priority inbox response */
export interface PriorityInboxResponse {
  topNotifications: PrioritizedNotification[];
  count: number;
  heapSize: number;
}
