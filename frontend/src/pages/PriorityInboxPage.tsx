/** PriorityInboxPage — Top N priority notifications from the heap */

import React from "react";
import { Box, Typography, Chip, Button, Divider } from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import RefreshIcon from "@mui/icons-material/Refresh";
import { usePriorityNotifications } from "../hooks/useNotifications";
import NotificationCard from "../components/NotificationCard";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const PriorityInboxPage: React.FC = () => {
  const { notifications, loading, error, heapSize, refresh } = usePriorityNotifications(10);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <PriorityHighIcon sx={{ fontSize: 36, color: "secondary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{
            background: "linear-gradient(135deg, #00E5FF, #18FFFF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Priority Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Top priority unread notifications powered by Min-Heap
          </Typography>
        </Box>
        <Button
          variant="outlined" color="secondary" startIcon={<RefreshIcon />}
          onClick={refresh} disabled={loading} size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Chip label={`Top ${notifications.length} shown`} size="small" color="secondary" variant="outlined" />
        <Chip label={`Heap: ${heapSize} items`} size="small" variant="outlined" sx={{ borderColor: "rgba(124,77,255,0.4)" }} />
        <Chip label="Algorithm: Min-Heap" size="small" variant="outlined" sx={{ borderColor: "rgba(0,229,255,0.3)" }} />
        <Chip label="O(log n) insert" size="small" variant="outlined" sx={{ borderColor: "rgba(0,230,118,0.3)" }} />
      </Box>

      <Divider sx={{ mb: 3, borderColor: "rgba(124,77,255,0.15)" }} />

      {/* Priority Legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#00E676" }} />
          <Typography variant="caption" color="text.secondary">Placement (W:3)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#FFAB00" }} />
          <Typography variant="caption" color="text.secondary">Result (W:2)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#448AFF" }} />
          <Typography variant="caption" color="text.secondary">Event (W:1)</Typography>
        </Box>
      </Box>

      {/* Content */}
      {loading && <SkeletonLoader count={5} />}
      {error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && notifications.length === 0 && (
        <EmptyState message="No priority notifications available" />
      )}
      {!loading && !error && notifications.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {notifications.map((n, idx) => (
            <Box key={n.id} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  minWidth: 36, textAlign: "center", fontWeight: 800,
                  color: idx < 3 ? "secondary.main" : "text.secondary",
                  opacity: idx < 3 ? 1 : 0.5,
                }}
              >
                #{idx + 1}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <NotificationCard notification={n} showPriority />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PriorityInboxPage;
