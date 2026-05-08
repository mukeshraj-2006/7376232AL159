/** FilterBar — sticky filter bar with type filter chips */

import React, { useCallback } from "react";
import { Box, Chip, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import type { NotificationType } from "../types/notification";

interface Props {
  activeFilter: NotificationType | undefined;
  onFilterChange: (type: NotificationType | undefined) => void;
}

const FILTERS: { label: string; value: NotificationType | undefined; color: string }[] = [
  { label: "All", value: undefined, color: "#7C4DFF" },
  { label: "Placement", value: "Placement", color: "#00E676" },
  { label: "Result", value: "Result", color: "#FFAB00" },
  { label: "Event", value: "Event", color: "#448AFF" },
];

const FilterBar: React.FC<Props> = React.memo(({ activeFilter, onFilterChange }) => {
  const handleClick = useCallback((value: NotificationType | undefined) => {
    onFilterChange(value);
  }, [onFilterChange]);

  return (
    <Box
      id="filter-bar"
      role="toolbar"
      aria-label="Filter notifications by type"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        px: 2,
        position: "sticky",
        top: 64,
        zIndex: 10,
        backdropFilter: "blur(20px)",
        background: "rgba(10,14,26,0.85)",
        borderBottom: "1px solid rgba(124,77,255,0.1)",
        borderRadius: 2,
        mb: 2,
        flexWrap: "wrap",
      }}
    >
      <FilterListIcon sx={{ color: "text.secondary", fontSize: 20 }} />
      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
        Filter:
      </Typography>
      {FILTERS.map((f) => (
        <Chip
          key={f.label}
          label={f.label}
          size="small"
          onClick={() => handleClick(f.value)}
          variant={activeFilter === f.value ? "filled" : "outlined"}
          sx={{
            borderColor: f.color + "66",
            color: activeFilter === f.value ? "#fff" : f.color,
            bgcolor: activeFilter === f.value ? f.color + "33" : "transparent",
            "&:hover": { bgcolor: f.color + "22" },
            fontWeight: 600,
            cursor: "pointer",
          }}
          aria-pressed={activeFilter === f.value}
        />
      ))}
    </Box>
  );
});

FilterBar.displayName = "FilterBar";
export default FilterBar;
