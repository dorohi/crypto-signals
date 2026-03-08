import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import { Box, CircularProgress, Typography } from "@mui/material";

export const AuthGuard = observer(function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authStore } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStore.initialized && !authStore.isAuthenticated) {
      navigate("/login");
    }
  }, [authStore.initialized, authStore.isAuthenticated, navigate]);

  if (!authStore.initialized || !authStore.isAuthenticated) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Загрузка...</Typography>
      </Box>
    );
  }

  return <>{children}</>;
});
