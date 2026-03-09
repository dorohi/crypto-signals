import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Box, Container, Toolbar } from "@mui/material";
import { useStore } from "@/stores/RootStore";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { watchlistStore, alertStore, settingsStore, portfolioStore } = useStore();

  // Предзагрузка всех данных при входе в дашборд
  useEffect(() => {
    watchlistStore.fetchWatchlist();
    alertStore.fetchAlerts();
    settingsStore.fetchSettings();
    portfolioStore.fetchPortfolio();
  }, [watchlistStore, alertStore, settingsStore, portfolioStore]);

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
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: 2, pb: 2 }}>
        <Toolbar />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
