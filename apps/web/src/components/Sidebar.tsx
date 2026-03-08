import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TelegramIcon from "@mui/icons-material/Telegram";
import SettingsIcon from "@mui/icons-material/Settings";

const navItems = [
  { href: "/watchlist", label: "Список наблюдения", icon: <ListAltIcon /> },
  { href: "/alerts", label: "Оповещения", icon: <NotificationsIcon /> },
  { href: "/telegram", label: "Telegram", icon: <TelegramIcon /> },
  { href: "/settings", label: "Настройки", icon: <SettingsIcon /> },
];

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("lg"));

  const drawerContent = (
    <Box sx={{ p: 1, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", p: 1, mb: 2 }}>
        {!collapsed && (
          <Box>
            <Typography variant="h6" fontWeight="bold">Крипто Сигналы</Typography>
            <Typography variant="caption" color="text.secondary">Мониторинг цен</Typography>
          </Box>
        )}
        <IconButton onClick={() => { onToggle(); if (isMobile) onMobileClose(); }} size="small" sx={{ color: "text.secondary" }}>
          {collapsed ? <MenuIcon /> : <CloseIcon fontSize="small" />}
        </IconButton>
      </Box>
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              to={item.href}
              onClick={() => { if (isMobile) onMobileClose(); }}
              selected={isActive}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                minHeight: 44,
                justifyContent: collapsed ? "center" : "initial",
                px: collapsed ? 1 : 2,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: "center" }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
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

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            position: "relative",
            bgcolor: "background.paper",
            borderRight: 1,
            borderColor: "divider",
            transition: "width 0.2s",
            overflowX: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
