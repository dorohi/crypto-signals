import { Link, useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TelegramIcon from "@mui/icons-material/Telegram";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 65;

const mainNavItems = [
  { href: "/watchlist", label: "Список наблюдения", icon: <ListAltIcon /> },
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
  const { authStore } = useStore();

  const showText = isMobile || open;

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
            borderRadius: 1,
            mb: 0.5,
            minHeight: 44,
            justifyContent: showText ? "initial" : "center",
            px: showText ? 2 : 1,
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
      <List sx={{ flexGrow: 1, px: 1 }}>
        {mainNavItems.map(renderNavItem)}
      </List>

      <Divider />

      {/* Настройки */}
      <List sx={{ px: 1 }}>
        {bottomNavItems.map(renderNavItem)}
      </List>

      <Divider />

      {/* Пользователь и выход */}
      <Box sx={{ p: 1 }}>
        <Tooltip title={!showText ? `${authStore.user?.name || ""} — Выйти` : ""} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              minHeight: 44,
              justifyContent: showText ? "initial" : "center",
              px: showText ? 2 : 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: showText ? 36 : 0, justifyContent: "center" }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main", color: "background.default" }}>
                {userInitials}
              </Avatar>
            </ListItemIcon>
            {showText && (
              <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap>{authStore.user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{authStore.user?.email}</Typography>
                </Box>
                <LogoutIcon fontSize="small" sx={{ color: "text.secondary", ml: 1 }} />
              </Box>
            )}
          </ListItemButton>
        </Tooltip>
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
          "& .MuiDrawer-paper": drawerStyles,
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
});