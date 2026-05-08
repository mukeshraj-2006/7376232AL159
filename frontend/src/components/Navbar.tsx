/** Navbar component with navigation links */

import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Badge } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import SchoolIcon from "@mui/icons-material/School";

const Navbar: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, rgba(18,24,41,0.95) 0%, rgba(10,14,26,0.98) 100%)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124, 77, 255, 0.2)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <SchoolIcon sx={{ color: "primary.main", fontSize: 32 }} />
        <Typography
          variant="h6"
          sx={{
            flexGrow: 0,
            mr: 4,
            background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/notifications")}
        >
          CampusNotify
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
          <Button
            startIcon={<Badge color="secondary" variant="dot"><NotificationsIcon /></Badge>}
            onClick={() => navigate("/notifications")}
            variant={isActive("/notifications") ? "contained" : "text"}
            color="primary"
            id="nav-notifications"
            aria-label="All Notifications"
          >
            All Notifications
          </Button>
          <Button
            startIcon={<PriorityHighIcon />}
            onClick={() => navigate("/priority-inbox")}
            variant={isActive("/priority-inbox") ? "contained" : "text"}
            color="secondary"
            id="nav-priority-inbox"
            aria-label="Priority Inbox"
          >
            Priority Inbox
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
