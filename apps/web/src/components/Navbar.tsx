import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Button, Typography, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar = observer(function Navbar({ onMenuToggle }: NavbarProps) {
  const { authStore } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar sx={{ minHeight: 56 }}>
        <IconButton
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { lg: "none" } }}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {authStore.user && (
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              {authStore.user.name}
            </Typography>
          )}
          <Button
            onClick={handleLogout}
            size="small"
            color="inherit"
            startIcon={<LogoutIcon />}
            sx={{ color: "text.secondary" }}
          >
            Выйти
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
});
