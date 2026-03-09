import { createTheme, type Theme } from "@mui/material/styles";

// ═══════════════════════════════════════════
// Общие настройки для всех тем
// ═══════════════════════════════════════════

const shared = {
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    button: { textTransform: "none" as const },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
  },
};

// ═══════════════════════════════════════════
// 1. Светлая тема (MUI default light)
// ═══════════════════════════════════════════

const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    background: { default: "#fafafa", paper: "#ffffff" },
  },
});

// ═══════════════════════════════════════════
// 2. Тёмная тема (MUI default dark)
// ═══════════════════════════════════════════

const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#ce93d8" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
});

// ═══════════════════════════════════════════
// 3. Matrix тема
// ═══════════════════════════════════════════

const m = {
  black: "#0D0208",
  darkGreen: "#003B00",
  green: "#008F11",
  brightGreen: "#00FF41",
  midGreen: "#005500",
  paper: "#0D0D0A",
  dimGreen: "#0a2a0a",
};

const matrixTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: m.green, dark: m.darkGreen, light: m.brightGreen },
    secondary: { main: m.green },
    background: { default: m.black, paper: m.paper },
    text: { primary: m.green, secondary: m.midGreen, disabled: m.darkGreen },
    divider: m.darkGreen,
    success: { main: m.green, dark: m.dimGreen },
    error: { main: "#8b0000", dark: "#1a0000" },
    info: { main: m.green },
    action: { hover: m.dimGreen, selected: "rgba(0,143,17,0.15)" },
  },
  typography: {
    fontFamily: "'Roboto Mono', 'Courier New', monospace",
    h4: { fontFamily: "'Roboto Mono', monospace", fontWeight: 700 },
    h5: { fontFamily: "'Roboto Mono', monospace", fontWeight: 700 },
    h6: { fontFamily: "'Roboto Mono', monospace", fontWeight: 600 },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
    caption: { fontSize: 11 },
    button: { textTransform: "none" as const },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: m.black, color: m.green } } },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontFamily: "'Roboto Mono', monospace", letterSpacing: 0.5 },
        contained: { backgroundColor: m.green, color: m.black, fontWeight: 700, "&:hover": { backgroundColor: m.brightGreen } },
        outlined: { borderColor: m.darkGreen, color: m.green, "&:hover": { borderColor: m.green, backgroundColor: m.dimGreen } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", borderColor: m.darkGreen, backgroundColor: m.paper } } },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            fontFamily: "'Roboto Mono', monospace",
            "& fieldset": { borderColor: m.darkGreen },
            "&:hover fieldset": { borderColor: m.midGreen },
            "&.Mui-focused fieldset": { borderColor: m.green },
          },
          "& .MuiInputLabel-root": { color: m.midGreen, fontFamily: "'Roboto Mono', monospace" },
          "& .MuiInputBase-input": { color: m.green },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderColor: m.darkGreen, fontFamily: "'Roboto Mono', monospace", fontSize: 13 }, head: { color: m.midGreen, fontWeight: 600 } } },
    MuiTableRow: { styleOverrides: { root: { "&:hover": { backgroundColor: `${m.dimGreen} !important` } } } },
    MuiSwitch: { styleOverrides: { switchBase: { "&.Mui-checked": { color: m.green }, "&.Mui-checked + .MuiSwitch-track": { backgroundColor: m.darkGreen } }, track: { backgroundColor: "#1a1a1a" } } },
    MuiChip: { styleOverrides: { outlined: { borderColor: m.darkGreen, color: m.green, fontFamily: "'Roboto Mono', monospace", fontSize: 12 } } },
    MuiDrawer: { styleOverrides: { paper: { borderColor: m.darkGreen, backgroundColor: m.paper } } },
    MuiAlert: { styleOverrides: { standardError: { backgroundColor: "rgba(139,0,0,0.15)", color: "#cc3333", border: "1px solid #330000" } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": { backgroundColor: m.dimGreen, color: m.brightGreen, "&:hover": { backgroundColor: "rgba(0,143,17,0.2)" }, "& .MuiListItemIcon-root": { color: m.brightGreen } },
          "&:hover": { backgroundColor: m.dimGreen },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { color: m.midGreen } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: m.paper } } },
    MuiAvatar: { styleOverrides: { root: { fontFamily: "'Roboto Mono', monospace" } } },
    MuiCircularProgress: { styleOverrides: { root: { color: m.green } } },
  },
});

// ═══════════════════════════════════════════
// 4. Spider-Man тема
// ═══════════════════════════════════════════

const sp = {
  black: "#070b18",
  darkRed: "#8b1313",
  red: "#DF1F2D",
  blue: "#2B3784",
  lightBlue: "#447BBE",
  paper: "#0c1225",
  darkBlue: "#162040",
  webGray: "#b0b8d0",
};

const spidermanTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: sp.red, dark: sp.darkRed, light: "#ff4444" },
    secondary: { main: sp.lightBlue, dark: sp.blue },
    background: { default: sp.black, paper: sp.paper },
    text: { primary: "#d8ddef", secondary: sp.webGray },
    divider: sp.darkBlue,
    success: { main: "#4caf50" },
    error: { main: sp.red, dark: sp.darkRed },
    info: { main: sp.lightBlue },
  },
  typography: {
    fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
    h4: { fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1 },
    h5: { fontWeight: 600, letterSpacing: 0.5 },
    h6: { fontWeight: 600 },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
    button: { textTransform: "none" as const, fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: sp.black } } },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
        contained: { backgroundColor: sp.red, color: "#fff", "&:hover": { backgroundColor: "#c41a26" } },
        outlined: { borderColor: sp.lightBlue, color: sp.lightBlue, "&:hover": { borderColor: "#5a9de0", backgroundColor: "rgba(68,123,190,0.1)" } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", borderColor: sp.darkBlue, backgroundColor: sp.paper } } },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: sp.darkBlue },
            "&:hover fieldset": { borderColor: sp.lightBlue },
            "&.Mui-focused fieldset": { borderColor: sp.lightBlue },
          },
          "& .MuiInputLabel-root": { color: sp.webGray },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderColor: sp.darkBlue }, head: { color: sp.lightBlue, fontWeight: 600 } } },
    MuiTableRow: { styleOverrides: { root: { "&:hover": { backgroundColor: `${sp.darkBlue} !important` } } } },
    MuiSwitch: { styleOverrides: { switchBase: { "&.Mui-checked": { color: sp.red }, "&.Mui-checked + .MuiSwitch-track": { backgroundColor: sp.darkRed } } } },
    MuiChip: { styleOverrides: { outlined: { borderColor: sp.blue, color: sp.lightBlue } } },
    MuiDrawer: { styleOverrides: { paper: { borderColor: sp.darkBlue, backgroundColor: sp.paper } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": { backgroundColor: sp.darkBlue, color: sp.red, "&:hover": { backgroundColor: "rgba(43,55,132,0.5)" }, "& .MuiListItemIcon-root": { color: sp.red } },
          "&:hover": { backgroundColor: sp.darkBlue },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { color: sp.lightBlue } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: sp.paper, borderColor: sp.darkBlue } } },
    MuiCircularProgress: { styleOverrides: { root: { color: sp.red } } },
  },
});

// ═══════════════════════════════════════════
// Экспорт
// ═══════════════════════════════════════════

export type ThemeKey = "light" | "dark" | "matrix" | "spiderman";

export const themes: Record<ThemeKey, { label: string; theme: Theme }> = {
  light: { label: "Светлая", theme: lightTheme },
  dark: { label: "Тёмная", theme: darkTheme },
  matrix: { label: "Matrix", theme: matrixTheme },
  spiderman: { label: "Человек-паук", theme: spidermanTheme },
};

export function getTheme(key: ThemeKey): Theme {
  return themes[key]?.theme ?? themes.matrix.theme;
}
