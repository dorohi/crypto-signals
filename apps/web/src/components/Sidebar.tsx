import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import { themes, type ThemeKey } from "@/lib/theme";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Avatar,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemAvatar,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TelegramIcon from "@mui/icons-material/Telegram";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PaletteIcon from "@mui/icons-material/Palette";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import TerminalIcon from "@mui/icons-material/Terminal";
import CheckIcon from "@mui/icons-material/Check";
import PestControlIcon from "@mui/icons-material/PestControl";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 65;

const mainNavItems = [
  { href: "/watchlist", label: "Список наблюдения", icon: <ListAltIcon /> },
  { href: "/portfolio", label: "Портфель", icon: <AccountBalanceWalletIcon /> },
  { href: "/alerts", label: "Оповещения", icon: <NotificationsIcon /> },
];

const bottomNavItems = [
  { href: "/telegram", label: "Telegram", icon: <TelegramIcon /> },
  { href: "/settings", label: "Настройки", icon: <SettingsIcon /> },
];

interface SidebarProps {
  open: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = observer(function Sidebar({ open, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("lg"));
  const { authStore, themeStore } = useStore();
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);

  const showText = isMobile || open;

  const themeIcons: Record<ThemeKey, React.ReactNode> = {
    light: <LightModeIcon fontSize="small" />,
    dark: <DarkModeIcon fontSize="small" />,
    matrix: <TerminalIcon fontSize="small" />,
    spiderman: <PestControlIcon fontSize="small" />,
  };

  const handleLogout = () => {
    authStore.logout();
    navigate("/login");
  };

  const renderNavItem = (item: { href: string; label: string; icon: React.ReactNode }) => {
    const isActive = location.pathname === item.href;
    return (
      <Tooltip key={item.href} title={!showText ? item.label : ""} placement="right">
        <ListItemButton
          component={Link}
          to={item.href}
          onClick={() => { if (isMobile) onMobileClose(); }}
          selected={isActive}
          sx={{
            minHeight: 44,
            justifyContent: showText ? "initial" : "center",
            px: showText ? 2.5 : 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: showText ? 36 : 0, justifyContent: "center" }}>
            {item.icon}
          </ListItemIcon>
          {showText && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />}
        </ListItemButton>
      </Tooltip>
    );
  };

  const userInitials = authStore.user?.name
    ? authStore.user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar />

      {/* Основная навигация */}
      <List sx={{ flexGrow: 1 }} disablePadding>
        {mainNavItems.map(renderNavItem)}
        {authStore.isAdmin && renderNavItem({ href: "/admin", label: "Админ-панель", icon: <AdminPanelSettingsIcon /> })}
      </List>

      <Divider />

      {/* Настройки */}
      <List disablePadding>
        {bottomNavItems.map(renderNavItem)}
      </List>

      <Divider />

      {/* Переключатель тем */}
      <Box>
        <Tooltip title={!showText ? "Тема" : ""} placement="right">
          <ListItemButton
            onClick={(e) => setThemeAnchor(e.currentTarget)}
            sx={{
              minHeight: 44,
              justifyContent: showText ? "initial" : "center",
              px: showText ? 2.5 : 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: showText ? 36 : 0, justifyContent: "center" }}>
              <PaletteIcon fontSize="small" />
            </ListItemIcon>
            {showText && <ListItemText primary={themes[themeStore.current].label} primaryTypographyProps={{ fontSize: 14 }} />}
          </ListItemButton>
        </Tooltip>
        <Menu
          anchorEl={themeAnchor}
          open={Boolean(themeAnchor)}
          onClose={() => setThemeAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          {(Object.keys(themes) as ThemeKey[]).map((key) => (
            <MenuItem
              key={key}
              selected={themeStore.current === key}
              onClick={() => { themeStore.setTheme(key); setThemeAnchor(null); }}
            >
              <ListItemIcon>{themeIcons[key]}</ListItemIcon>
              <ListItemText>{themes[key].label}</ListItemText>
              {themeStore.current === key && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Divider />

      {/* Пользователь и выход */}
      <Box sx={{ px: showText ? 2 : 1, py: 1.5, display: "flex", alignItems: "center", justifyContent: showText ? "space-between" : "center" }}>
        <Tooltip title={!showText ? authStore.user?.name || "" : ""} placement="right">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main", color: "background.default", flexShrink: 0 }}>
              {userInitials}
            </Avatar>
            {showText && (
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>{authStore.user?.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{authStore.user?.email}</Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
        {showText && (
          <Tooltip title="Выйти">
            <IconButton size="small" onClick={handleLogout} sx={{ color: "text.secondary" }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  const drawerStyles = {
    width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
    transition: muiTheme.transitions.create("width", {
      easing: muiTheme.transitions.easing.sharp,
      duration: muiTheme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden" as const,
    whiteSpace: "nowrap" as const,
    bgcolor: "background.paper",
    borderColor: "divider",
  };

  return (
    <>
      {/* Мобильный drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, bgcolor: "background.paper" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Десктопный drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: "none", lg: "block" },
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            ...drawerStyles,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
});