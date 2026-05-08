/** NotificationsPage — All Notifications with filtering and pagination */

import React, { useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useNotifications } from "../hooks/useNotifications";
import NotificationCard from "../components/NotificationCard";
import FilterBar from "../components/FilterBar";
import PaginationControl from "../components/PaginationControl";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const NotificationsPage: React.FC = () => {
  const {
    notifications, pagination, loading, error,
    setPage, typeFilter, setTypeFilter, refresh, markRead,
  } = useNotifications(20);

  const sortedNotifications = useMemo(() =>
    [...notifications].sort((a, b) => b.priorityScore - a.priorityScore),
    [notifications]
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <NotificationsActiveIcon sx={{ fontSize: 36, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" sx={{ 
            background: "linear-gradient(135deg, #B388FF, #7C4DFF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            All Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse and filter campus notifications
          </Typography>
        </Box>
        {pagination && (
          <Chip label={`${pagination.totalItems} items`} size="small" variant="outlined" color="primary" sx={{ ml: "auto" }} />
        )}
      </Box>

      {/* Filter Bar */}
      <FilterBar activeFilter={typeFilter} onFilterChange={(t) => { setTypeFilter(t); setPage(1); }} />

      {/* Content */}
      {loading && <SkeletonLoader count={6} />}
      {error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && sortedNotifications.length === 0 && <EmptyState />}
      {!loading && !error && sortedNotifications.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {sortedNotifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={markRead} showPriority />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {!loading && !error && pagination && (
        <PaginationControl pagination={pagination} onPageChange={setPage} />
      )}
    </Box>
  );
};

export default NotificationsPage;
