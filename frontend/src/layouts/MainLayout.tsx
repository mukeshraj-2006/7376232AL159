/** MainLayout — wraps pages with Navbar and container */

import React from "react";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout: React.FC = () => (
  <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
    <Navbar />
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Outlet />
    </Container>
  </Box>
);

export default MainLayout;
