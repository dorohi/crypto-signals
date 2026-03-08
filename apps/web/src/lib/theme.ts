import { createTheme } from "@mui/material/styles";

// Authentic Matrix palette from the 1999 film
// Desaturated, muted greens — not neon bright
const matrix = {
  black: "#0D0208",        // Vampire Black — true Matrix background
  darkGreen: "#003B00",    // Dark traditional green — borders, dividers
  green: "#008F11",        // Islam Green — primary text, main UI color
  brightGreen: "#00FF41",  // Erin — only for highlights, active states
  midGreen: "#005500",     // Mid-tone green for secondary elements
  paper: "#0D0D0A",        // Slightly warmer dark for paper/cards
  dimGreen: "#0a2a0a",     // Very dark green for hover states
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: matrix.green,
      dark: matrix.darkGreen,
      light: matrix.brightGreen,
    },
    secondary: {
      main: matrix.green,
    },
    background: {
      default: matrix.black,
      paper: matrix.paper,
    },
    text: {
      primary: matrix.green,
      secondary: matrix.midGreen,
      disabled: matrix.darkGreen,
    },
    divider: matrix.darkGreen,
    success: {
      main: matrix.green,
      dark: matrix.dimGreen,
    },
    error: {
      main: "#8b0000",
      dark: "#1a0000",
    },
    info: {
      main: matrix.green,
    },
    action: {
      hover: matrix.dimGreen,
      selected: "rgba(0,143,17,0.15)",
    },
  },
  typography: {
    fontFamily: "'Roboto Mono', 'Courier New', monospace",
    h4: { fontFamily: "'Roboto Mono', monospace", fontWeight: 700 },
    h5: { fontFamily: "'Roboto Mono', monospace", fontWeight: 700 },
    h6: { fontFamily: "'Roboto Mono', monospace", fontWeight: 600 },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
    caption: { fontSize: 11 },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: matrix.black,
          color: matrix.green,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontFamily: "'Roboto Mono', monospace",
          letterSpacing: 0.5,
        },
        contained: {
          backgroundColor: matrix.green,
          color: matrix.black,
          fontWeight: 700,
          "&:hover": {
            backgroundColor: matrix.brightGreen,
          },
        },
        outlined: {
          borderColor: matrix.darkGreen,
          color: matrix.green,
          "&:hover": {
            borderColor: matrix.green,
            backgroundColor: matrix.dimGreen,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderColor: matrix.darkGreen,
          backgroundColor: matrix.paper,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            fontFamily: "'Roboto Mono', monospace",
            "& fieldset": {
              borderColor: matrix.darkGreen,
            },
            "&:hover fieldset": {
              borderColor: matrix.midGreen,
            },
            "&.Mui-focused fieldset": {
              borderColor: matrix.green,
            },
          },
          "& .MuiInputLabel-root": {
            color: matrix.midGreen,
            fontFamily: "'Roboto Mono', monospace",
          },
          "& .MuiInputBase-input": {
            color: matrix.green,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: matrix.darkGreen,
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 13,
        },
        head: {
          color: matrix.midGreen,
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: `${matrix.dimGreen} !important`,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: matrix.green,
          },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: matrix.darkGreen,
          },
        },
        track: {
          backgroundColor: "#1a1a1a",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: matrix.darkGreen,
          color: matrix.green,
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderColor: matrix.darkGreen,
          backgroundColor: matrix.paper,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardError: {
          backgroundColor: "rgba(139,0,0,0.15)",
          color: "#cc3333",
          border: `1px solid #330000`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: matrix.dimGreen,
            color: matrix.brightGreen,
            "&:hover": {
              backgroundColor: "rgba(0,143,17,0.2)",
            },
            "& .MuiListItemIcon-root": {
              color: matrix.brightGreen,
            },
          },
          "&:hover": {
            backgroundColor: matrix.dimGreen,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: matrix.midGreen,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: matrix.paper,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: "'Roboto Mono', monospace",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: matrix.green,
        },
      },
    },
  },
});
