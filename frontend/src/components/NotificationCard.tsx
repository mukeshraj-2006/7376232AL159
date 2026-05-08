/** NotificationCard — displays a single notification with priority badge */

import React, { useCallback } from "react";
import { Card, CardContent, Typography, Box, Chip, IconButton } from "@mui/material";
import MarkEmailRead from "@mui/icons-material/MarkEmailRead";
import MailOutline from "@mui/icons-material/MailOutlined";
import type { Notification } from "../types/notification";
import { getRelativeTime, getTypeColor } from "../utils/formatters";
import PriorityBadge from "./PriorityBadge";

interface Props {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  showPriority?: boolean;
}

const NotificationCard: React.FC<Props> = React.memo(({ notification, onMarkRead, showPriority = false }) => {
  const { id, type, message, timestamp, read, priorityScore, typeWeight } = notification;

  const handleMarkRead = useCallback(() => {
    onMarkRead?.(id);
  }, [id, onMarkRead]);

  return (
    <Card
      id={`notification-${id}`}
      sx={{
        opacity: read ? 0.7 : 1,
        position: "relative",
        overflow: "visible",
        background: read
          ? "rgba(18,24,41,0.6)"
          : "linear-gradient(135deg, rgba(18,24,41,0.9) 0%, rgba(30,20,60,0.8) 100%)",
        "&::before": !read ? {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 4,
          height: "60%",
          borderRadius: 2,
          background: type === "Placement" ? "#00E676" : type === "Result" ? "#FFAB00" : "#448AFF",
        } : {},
      }}
      role="article"
      aria-label={`${type} notification: ${message}`}
    >
      <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
            <Chip
              label={type}
              size="small"
              color={getTypeColor(type)}
              variant="filled"
              sx={{ fontSize: "0.7rem", height: 24 }}
            />
            {showPriority && <PriorityBadge weight={typeWeight} score={priorityScore} />}
            {!read && (
              <Chip label="NEW" size="small" color="secondary" variant="outlined"
                sx={{ fontSize: "0.65rem", height: 20, animation: "pulse 2s infinite" }} />
            )}
          </Box>
          <Typography variant="body1" sx={{ fontWeight: read ? 400 : 600, mt: 1, lineHeight: 1.5 }}>
            {message}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {getRelativeTime(timestamp)}
          </Typography>
        </Box>
        <IconButton
          onClick={handleMarkRead}
          size="small"
          color={read ? "default" : "primary"}
          aria-label={read ? "Already read" : "Mark as read"}
          disabled={read}
        >
          {read ? <MarkEmailRead fontSize="small" /> : <MailOutline fontSize="small" />}
        </IconButton>
      </CardContent>
    </Card>
  );
});

NotificationCard.displayName = "NotificationCard";
export default NotificationCard;
