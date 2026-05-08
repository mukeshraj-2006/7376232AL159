/** App.tsx — Root application with routing and MUI theme */

import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./styles/theme";
import MainLayout from "./layouts/MainLayout";
import NotificationsPage from "./pages/NotificationsPage";
import PriorityInboxPage from "./pages/PriorityInboxPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/priority-inbox" element={<PriorityInboxPage />} />
            <Route path="*" element={<Navigate to="/notifications" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
