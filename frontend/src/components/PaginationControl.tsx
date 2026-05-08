/** PaginationControl — page navigation */

import React from "react";
import { Box, Pagination, Typography } from "@mui/material";
import type { PaginationInfo } from "../types/notification";

interface Props {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const PaginationControl: React.FC<Props> = React.memo(({ pagination, onPageChange }) => {
  const totalPages = Math.max(pagination.currentPage + 2, pagination.totalPages, 5);

  return (
    <Box
      id="pagination-control"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, py: 3 }}
      role="navigation"
      aria-label="Pagination"
    >
      <Pagination
        count={totalPages}
        page={pagination.currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        sx={{
          "& .MuiPaginationItem-root": {
            color: "#B388FF",
            borderColor: "rgba(124,77,255,0.3)",
            "&.Mui-selected": {
              background: "linear-gradient(135deg, #7C4DFF, #651FFF)",
              color: "#fff",
            },
          },
        }}
      />
      <Typography variant="caption" color="text.secondary">
        Page {pagination.currentPage}
      </Typography>
    </Box>
  );
});

PaginationControl.displayName = "PaginationControl";
export default PaginationControl;
