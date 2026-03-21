import { Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import WatchlistPage from "@/pages/WatchlistPage";
import AlertsPage from "@/pages/AlertsPage";
import SettingsPage from "@/pages/SettingsPage";
import TelegramPage from "@/pages/TelegramPage";
import CoinPage from "@/pages/CoinPage";
import PortfolioPage from "@/pages/PortfolioPage";
import AdminPage from "@/pages/AdminPage";

export const App = observer(function App() {
  const { authStore } = useStore();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/telegram" element={<TelegramPage />} />
        <Route path="/coin/:id" element={<CoinPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route
        path="*"
        element={
          authStore.initialized ? (
            <Navigate to={authStore.isAuthenticated ? "/watchlist" : "/login"} replace />
          ) : null
        }
      />
    </Routes>
  );
});
