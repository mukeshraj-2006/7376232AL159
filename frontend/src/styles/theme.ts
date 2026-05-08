/** MUI Theme configuration — dark premium theme */

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7C4DFF", light: "#B388FF", dark: "#651FFF" },
    secondary: { main: "#00E5FF", light: "#18FFFF", dark: "#00B8D4" },
    background: { default: "#0A0E1A", paper: "#121829" },
    success: { main: "#00E676" },
    warning: { main: "#FFAB00" },
    error: { main: "#FF5252" },
    info: { main: "#448AFF" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 16,
          border: "1px solid rgba(124, 77, 255, 0.15)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: "rgba(124, 77, 255, 0.4)",
            boxShadow: "0 8px 32px rgba(124, 77, 255, 0.15)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: "0.5px" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
  },
});

export default theme;
