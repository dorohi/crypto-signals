"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
