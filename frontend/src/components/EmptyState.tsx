/** EmptyState — shown when no notifications are found */

import React from "react";
import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

interface Props { message?: string }

const EmptyState: React.FC<Props> = React.memo(({ message = "No notifications found" }) => (
  <Box
    id="empty-state"
    sx={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      py: 8, gap: 2, opacity: 0.6,
    }}
    role="status"
  >
    <InboxIcon sx={{ fontSize: 80, color: "text.secondary" }} />
    <Typography variant="h6" color="text.secondary">{message}</Typography>
    <Typography variant="body2" color="text.secondary">Try changing filters or check back later.</Typography>
  </Box>
));

EmptyState.displayName = "EmptyState";
export default EmptyState;
