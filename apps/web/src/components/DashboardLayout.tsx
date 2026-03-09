import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Container, Toolbar } from "@mui/material";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
      />
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: 3, pb: 3 }}>
        <Toolbar />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
