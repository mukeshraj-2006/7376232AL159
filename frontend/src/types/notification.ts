/** Notification types shared between frontend and backend */

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  epochTime: number;
  read: boolean;
  priorityScore: number;
  typeWeight: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: PaginationInfo;
}

export interface PriorityInboxResponse {
  topNotifications: Notification[];
  count: number;
  heapSize: number;
  heapCapacity: number;
}
