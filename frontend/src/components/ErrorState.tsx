/** ErrorState — shown when API call fails */

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ErrorOutline from "@mui/icons-material/ErrorOutlineOutlined";
import Refresh from "@mui/icons-material/RefreshOutlined";

interface Props {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<Props> = React.memo(({ message = "Something went wrong", onRetry }) => (
  <Box
    id="error-state"
    sx={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      py: 8, gap: 2,
    }}
    role="alert"
  >
    <ErrorOutline sx={{ fontSize: 80, color: "error.main" }} />
    <Typography variant="h6" color="error.main">Oops! An error occurred</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: "center" }}>
      {message}
    </Typography>
    {onRetry && (
      <Button variant="outlined" color="primary" startIcon={<Refresh />} onClick={onRetry} sx={{ mt: 1 }}>
        Retry
      </Button>
    )}
  </Box>
));

ErrorState.displayName = "ErrorState";
export default ErrorState;
