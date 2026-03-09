import { AppBar, Toolbar, IconButton, Typography, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";

interface NavbarProps {
  onToggleSidebar: () => void;
  onMobileToggle: () => void;
}

export function Navbar({ onToggleSidebar, onMobileToggle }: NavbarProps) {
  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ minHeight: 56 }}>
        <IconButton
          onClick={onToggleSidebar}
          color="inherit"
          sx={{ mr: 2, display: { xs: "none", lg: "block" } }}
        >
          <MenuIcon />
        </IconButton>
        <IconButton
          onClick={onMobileToggle}
          color="inherit"
          sx={{ mr: 2, display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <CurrencyBitcoinIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Крипто Сигналы
        </Typography>
      </Toolbar>
    </AppBar>
  );
}