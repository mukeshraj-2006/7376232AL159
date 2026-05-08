/** useNotifications hook — data fetching with loading/error states */

import { useState, useEffect, useCallback } from "react";
import type { Notification, PaginationInfo, NotificationType } from "../types/notification";
import { fetchNotifications, fetchPriorityNotifications, markAsRead } from "../services/api";

interface UseNotificationsReturn {
  notifications: Notification[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (p: number) => void;
  typeFilter: NotificationType | undefined;
  setTypeFilter: (t: NotificationType | undefined) => void;
  refresh: () => void;
  markRead: (id: string) => void;
}

export function useNotifications(limit: number = 20): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<NotificationType | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(page, limit, typeFilter);
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load notifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, typeFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const markRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch { /* silent */ }
  }, []);

  return {
    notifications, pagination, loading, error,
    page, setPage, typeFilter, setTypeFilter,
    refresh: loadData, markRead,
  };
}

interface UsePriorityReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  heapSize: number;
  refresh: () => void;
}

export function usePriorityNotifications(n: number = 10): UsePriorityReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heapSize, setHeapSize] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPriorityNotifications(n);
      setNotifications(data.topNotifications);
      setHeapSize(data.heapSize);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load priority notifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [n]);

  useEffect(() => { loadData(); }, [loadData]);

  return { notifications, loading, error, heapSize, refresh: loadData };
}
