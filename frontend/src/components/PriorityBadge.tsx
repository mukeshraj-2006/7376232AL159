/** PriorityBadge — shows type weight and priority score */

import React from "react";
import { Chip, Tooltip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface Props {
  weight: number;
  score: number;
}

const PriorityBadge: React.FC<Props> = React.memo(({ weight, score }) => {
  const label = `W:${weight}`;
  const colors = ["", "#448AFF", "#FFAB00", "#00E676"]; // 1=blue, 2=amber, 3=green

  return (
    <Tooltip title={`Priority Score: ${score.toLocaleString()}`} arrow>
      <Chip
        icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
        label={label}
        size="small"
        sx={{
          fontSize: "0.65rem",
          height: 20,
          bgcolor: `${colors[weight] || colors[1]}22`,
          color: colors[weight] || colors[1],
          border: `1px solid ${colors[weight] || colors[1]}44`,
        }}
      />
    </Tooltip>
  );
});

PriorityBadge.displayName = "PriorityBadge";
export default PriorityBadge;
