import { type PaletteMode } from "@mui/material";
declare module "@mui/material/styles" {
  interface Palette {
    brand: {
      teal: string;
      tealLight: string;
      tealXLight: string;
      tealDark: string;
      tealDeep: string;
      gold: string;
      goldLight: string;
      goldXLight: string;
      goldDark: string;
      indigo: string;
      indigoLight: string;
      ivory0: string;
      ivory1: string;
      ivory2: string;
      ivory3: string;
      navy0: string;
      navy1: string;
      navy2: string;
      navy3: string;
      navy4: string;
    };
    surface: {
      card: string;
      overlay: string;
      glass: string;
      border: string;
      borderGold: string;
      sidebarBg: string;
      sidebarText: string;
    };
  }
  interface PaletteOptions {
    brand?: {
      teal?: string;
      tealLight?: string;
      tealXLight?: string;
      tealDark?: string;
      tealDeep?: string;
      gold?: string;
      goldLight?: string;
      goldXLight?: string;
      goldDark?: string;
      indigo?: string;
      indigoLight?: string;
      ivory0?: string;
      ivory1?: string;
      ivory2?: string;
      ivory3?: string;
      navy0?: string;
      navy1?: string;
      navy2?: string;
      navy3?: string;
      navy4?: string;
    };
    surface?: {
      card?: string;
      overlay?: string;
      glass?: string;
      border?: string;
      borderGold?: string;
      sidebarBg?: string;
      sidebarText?: string;
    };
  }
  interface TypeBackground {
    subtle?: string;
    elevated?: string;
  }
  interface TypeBackgroundOptions {
    subtle?: string;
    elevated?: string;
  }
}

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,

    brand: {
      teal: "#0A7080",
      tealLight: "#0E9AAE",
      tealXLight: "#4ECBD8",
      tealDark: "#065A68",
      tealDeep: "#053F4A",

      gold: "#B8945A",
      goldLight: "#D4AE72",
      goldXLight: "#EDD9A3",
      goldDark: "#8C6E3A",

      indigo: "#3A5491",
      indigoLight: "#5E78B8",

      ivory0: "#FAF7F2",
      ivory1: "#F3EEE6",
      ivory2: "#EDE5D8",
      ivory3: "#E4D9C8",

      navy0: "#070E1A",
      navy1: "#0A1624",
      navy2: "#0D1D30",
      navy3: "#11253D",
      navy4: "#162E4A",
    },

    ...(mode === "light"
      ? {
          primary: {
            main: "#0A7080",
            light: "#0E9AAE",
            dark: "#065A68",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: "#3A5491",
            light: "#5E78B8",
            dark: "#283B6B",
            contrastText: "#FFFFFF",
          },
          error: {
            main: "#C0392B",
            light: "#E74C3C",
            dark: "#96281B",
            contrastText: "#FFFFFF",
          },
          warning: {
            main: "#B8945A",
            light: "#D4AE72",
            dark: "#8C6E3A",
            contrastText: "#FFFFFF",
          },
          info: {
            main: "#1A6FA8",
            light: "#3A96CC",
            dark: "#10527E",
            contrastText: "#FFFFFF",
          },
          success: {
            main: "#2D7A4F",
            light: "#3EA86B",
            dark: "#1E5434",
            contrastText: "#FFFFFF",
          },
          text: {
            primary: "#1C1208",
            secondary: "rgba(28, 18, 8, 0.60)",
            disabled: "rgba(28, 18, 8, 0.35)",
          },
          background: {
            default: "#FAF7F2",
            paper: "#FFFFFF",
            subtle: "#F3EEE6",
            elevated: "#FFFFFF",
          },
          divider: "rgba(10, 112, 128, 0.14)",
          surface: {
            card: "#FFFFFF",
            overlay: "rgba(250, 247, 242, 0.92)",
            glass: "rgba(250, 247, 242, 0.80)",
            border: "rgba(10, 112, 128, 0.16)",
            borderGold: "rgba(184, 148, 90, 0.30)",
            sidebarBg: "linear-gradient(180deg, #0A7080 0%, #053F4A 100%)",
            sidebarText: "#FFFFFF",
          },
        }
      : {
          primary: {
            main: "#14A3B4",
            light: "#4ECBD8",
            dark: "#0A7080",
            contrastText: "#070E1A",
          },
          secondary: {
            main: "#5E78B8",
            light: "#8FA3D6",
            dark: "#3A5491",
            contrastText: "#070E1A",
          },
          error: {
            main: "#EF5350",
            light: "#FF7B7B",
            dark: "#C0392B",
            contrastText: "#FFFFFF",
          },
          warning: {
            main: "#D4AE72",
            light: "#EDD9A3",
            dark: "#B8945A",
            contrastText: "#070E1A",
          },
          info: {
            main: "#29B6F6",
            light: "#70D4FF",
            dark: "#1A6FA8",
            contrastText: "#070E1A",
          },
          success: {
            main: "#5CB87A",
            light: "#8ED4A4",
            dark: "#2D7A4F",
            contrastText: "#070E1A",
          },
          text: {
            primary: "#EEF4FA",
            secondary: "rgba(238, 244, 250, 0.68)",
            disabled: "rgba(238, 244, 250, 0.35)",
          },
          background: {
            default: "#0A1624",
            paper: "#0D1D30",
            subtle: "#11253D",
            elevated: "#162E4A",
          },
          divider: "rgba(20, 163, 180, 0.15)",
          surface: {
            card: "#0D1D30",
            overlay: "rgba(13, 29, 48, 0.92)",
            glass: "rgba(13, 29, 48, 0.72)",
            border: "rgba(20, 163, 180, 0.16)",
            borderGold: "rgba(184, 148, 90, 0.22)",
            sidebarBg: "linear-gradient(180deg, #070E1A 0%, #0D1D30 100%)",
            sidebarText: "#EEF4FA",
          },
        }),
  },

  typography: {
    fontFamily: '"Jost", "Inter", system-ui, sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 300,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 300,
      letterSpacing: "-0.01em",
    },
    h3: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 400 },
    h4: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 400 },
    h5: { fontFamily: '"Jost", sans-serif', fontWeight: 500 },
    h6: { fontFamily: '"Jost", sans-serif', fontWeight: 600 },
    subtitle1: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 400,
      letterSpacing: "0.02em",
    },
    subtitle2: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 500,
      letterSpacing: "0.04em",
    },
    body1: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 300,
      lineHeight: 1.8,
    },
    body2: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 300,
      lineHeight: 1.75,
    },
    button: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "none" as const,
    },
    overline: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 500,
      letterSpacing: "0.28em",
    },
    caption: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 300,
      letterSpacing: "0.04em",
    },
  },

  shape: { borderRadius: 6 },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        body { -webkit-font-smoothing: antialiased; }
      `,
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          letterSpacing: "0.06em",
          borderRadius: 6,
          fontWeight: 500,
          transition: "all 0.22s ease",
          fontFamily: '"Jost", sans-serif',
        },
        containedPrimary: ({ theme }: { theme: any }) => ({
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, #0A7080 0%, #053F4A 100%)`
              : `linear-gradient(135deg, #0A7080 0%, #3A5491 100%)`,
          color: "#FFFFFF",
          boxShadow: "none",
          "&:hover": {
            background:
              theme.palette.mode === "light"
                ? `linear-gradient(135deg, #0E9AAE 0%, #0A7080 100%)`
                : `linear-gradient(135deg, #14A3B4 0%, #3A5491 100%)`,
            boxShadow: "0 6px 20px rgba(10, 112, 128, 0.35)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        }),
        outlinedPrimary: ({ theme }: { theme: any }) => ({
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.40)"
              : "rgba(20, 163, 180, 0.40)",
          color: theme.palette.mode === "light" ? "#0A7080" : "#14A3B4",
          "&:hover": {
            borderColor: theme.palette.mode === "light" ? "#0A7080" : "#4ECBD8",
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.07)"
                : "rgba(20, 163, 180, 0.10)",
          },
        }),
        textPrimary: ({ theme }: { theme: any }) => ({
          color: theme.palette.mode === "light" ? "#0A7080" : "#14A3B4",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.07)"
                : "rgba(20, 163, 180, 0.10)",
          },
        }),
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          backgroundImage: "none",
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(250, 247, 242, 0.95)"
              : "rgba(7, 14, 26, 0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.14)"
              : "rgba(20, 163, 180, 0.14)"
          }`,
          boxShadow:
            theme.palette.mode === "light"
              ? "0 1px 0 rgba(10, 112, 128, 0.08)"
              : "none",
          color: theme.palette.mode === "light" ? "#1C1208" : "#EEF4FA",
        }),
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }: { theme: any }) => ({
          backgroundImage: "none",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #0A7080 0%, #065A68 60%, #053F4A 100%)"
              : "linear-gradient(180deg, #070E1A 0%, #0A1624 50%, #0D1D30 100%)",
          borderRight: "none",
          boxShadow:
            theme.palette.mode === "light"
              ? "2px 0 20px rgba(5, 63, 74, 0.20)"
              : "2px 0 20px rgba(0, 0, 0, 0.40)",
        }),
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          borderRadius: 6,
          margin: "1px 8px",
          transition: "all 0.2s ease",
          color:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.78)"
              : "rgba(238,244,250,0.70)",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.14)"
                : "rgba(20,163,180,0.10)",
            color: "#FFFFFF",
          },
          "&.Mui-selected": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.20)"
                : "rgba(20,163,180,0.18)",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(255,255,255,0.26)"
                  : "rgba(20,163,180,0.26)",
            },
          },
          "& .MuiListItemIcon-root": {
            color:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.78)"
                : "rgba(78,203,216,0.85)",
            minWidth: 36,
          },
          "&.Mui-selected .MuiListItemIcon-root": {
            color: theme.palette.mode === "light" ? "#FFFFFF" : "#4ECBD8",
          },
        }),
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontWeight: 400,
          fontSize: "0.88rem",
          letterSpacing: "0.03em",
        }),
        secondary: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          fontSize: "0.76rem",
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontWeight: 600,
          fontSize: "0.62rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          backgroundColor: "transparent",
          color:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.50)"
              : "rgba(78,203,216,0.60)",
          padding: "16px 16px 4px",
        }),
      },
    },

    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          backgroundImage: "none",
          backgroundColor:
            theme.palette.mode === "light" ? "#FFFFFF" : "#0D1D30",
          border: `1px solid ${
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.13)"
              : "rgba(20, 163, 180, 0.13)"
          }`,
          borderRadius: 8,
          transition:
            "border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease",
          "&:hover": {
            borderColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.30)"
                : "rgba(20, 163, 180, 0.30)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 4px 20px rgba(10, 112, 128, 0.10)"
                : "0 4px 20px rgba(0, 0, 0, 0.30)",
          },
        }),
      },
    },

    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 400,
          fontSize: "1.2rem",
        },
        subheader: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          fontSize: "0.78rem",
          letterSpacing: "0.04em",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          backgroundImage: "none",
          backgroundColor:
            theme.palette.mode === "light" ? "#FFFFFF" : "#0D1D30",
        }),
        rounded: { borderRadius: 8 },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          borderRadius: 6,
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.03)"
              : "rgba(20, 163, 180, 0.04)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.22)"
                : "rgba(20, 163, 180, 0.20)",
            transition: "border-color 0.2s ease",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.50)"
                : "rgba(20, 163, 180, 0.45)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.mode === "light" ? "#0A7080" : "#14A3B4",
            borderWidth: "1.5px",
          },
          "&.Mui-focused": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.05)"
                : "rgba(20, 163, 180, 0.07)",
          },
        }),
        input: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          fontSize: "0.92rem",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontWeight: 400,
          fontSize: "0.9rem",
          letterSpacing: "0.03em",
          color:
            theme.palette.mode === "light"
              ? "rgba(28, 18, 8, 0.52)"
              : "rgba(238, 244, 250, 0.52)",
          "&.Mui-focused": {
            color: theme.palette.mode === "light" ? "#0A7080" : "#4ECBD8",
          },
        }),
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          fontSize: "0.72rem",
          letterSpacing: "0.02em",
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          fontSize: "0.92rem",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          fontSize: "0.88rem",
          letterSpacing: "0.02em",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.07)"
                : "rgba(20, 163, 180, 0.10)",
          },
          "&.Mui-selected": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.10)"
                : "rgba(20, 163, 180, 0.14)",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(10, 112, 128, 0.15)"
                  : "rgba(20, 163, 180, 0.20)",
            },
          },
        }),
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontSize: "0.87rem",
          fontWeight: 300,
          letterSpacing: "0.02em",
          borderBottomColor:
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.10)"
              : "rgba(20, 163, 180, 0.10)",
        }),
        head: ({ theme }: { theme: any }) => ({
          fontWeight: 600,
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: theme.palette.mode === "light" ? "#0A7080" : "#4ECBD8",
          borderBottom: `2px solid ${
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.18)"
              : "rgba(20, 163, 180, 0.20)"
          }`,
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.04)"
              : "rgba(20, 163, 180, 0.04)",
        }),
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          transition: "background 0.15s ease",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.04)"
                : "rgba(20, 163, 180, 0.05)",
          },
        }),
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 500,
          fontSize: "0.72rem",
          letterSpacing: "0.05em",
          borderRadius: 6,
        },
        colorPrimary: ({ theme }: { theme: any }) => ({
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.12)"
              : "rgba(20, 163, 180, 0.16)",
          color: theme.palette.mode === "light" ? "#065A68" : "#4ECBD8",
        }),
      },
    },

    MuiTab: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontWeight: 500,
          fontSize: "0.78rem",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          minHeight: 44,
          transition: "color 0.2s ease",
          color:
            theme.palette.mode === "light"
              ? "rgba(28,18,8,0.55)"
              : "rgba(238,244,250,0.55)",
          "&.Mui-selected": {
            color: theme.palette.mode === "light" ? "#0A7080" : "#4ECBD8",
          },
        }),
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }: { theme: any }) => ({
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(90deg, #0A7080, #3A5491)"
              : "linear-gradient(90deg, #14A3B4, #5E78B8)",
          height: 2,
          borderRadius: 999,
        }),
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          fontSize: "0.72rem",
          letterSpacing: "0.04em",
          backgroundColor:
            theme.palette.mode === "light" ? "#053F4A" : "#162E4A",
          color: "#EEF4FA",
          border: `1px solid rgba(20, 163, 180, 0.2)`,
          borderRadius: 6,
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        }),
        arrow: ({ theme }: { theme: any }) => ({
          color: theme.palette.mode === "light" ? "#053F4A" : "#162E4A",
        }),
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }: { theme: any }) => ({
          backgroundImage: "none",
          backgroundColor:
            theme.palette.mode === "light" ? "#FFFFFF" : "#0D1D30",
          border: `1px solid ${
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.15)"
              : "rgba(20, 163, 180, 0.15)"
          }`,
          borderRadius: 10,
          boxShadow:
            theme.palette.mode === "light"
              ? "0 20px 60px rgba(5, 63, 74, 0.18)"
              : "0 20px 60px rgba(0, 0, 0, 0.60)",
        }),
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 400,
          fontSize: "1.4rem",
          letterSpacing: "0.02em",
        },
      },
    },

    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          lineHeight: 1.8,
          fontSize: "0.92rem",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }: { theme: any }) => ({
          backgroundImage: "none",
          backgroundColor:
            theme.palette.mode === "light" ? "#FFFFFF" : "#0D1D30",
          border: `1px solid ${
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.16)"
              : "rgba(20, 163, 180, 0.16)"
          }`,
          borderRadius: 8,
          boxShadow:
            theme.palette.mode === "light"
              ? "0 8px 32px rgba(5, 63, 74, 0.14)"
              : "0 8px 32px rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(12px)",
        }),
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(230, 241, 243, 0.56)"
              : "rgba(20, 163, 180, 0.12)",
        }),
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          borderRadius: 6,
          fontSize: "0.88rem",
          letterSpacing: "0.02em",
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 600,
          fontSize: "0.65rem",
          letterSpacing: "0.02em",
          borderRadius: 999,
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          backgroundImage: "none",
          backgroundColor:
            theme.palette.mode === "light" ? "#FFFFFF" : "#0D1D30",
          border: `1px solid ${
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.14)"
              : "rgba(20, 163, 180, 0.14)"
          }`,
          borderRadius: "8px !important",
          "&:before": { display: "none" },
        }),
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 400,
          borderRadius: 6,
        },
      },
    },

    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontFamily: '"Jost", sans-serif',
          fontSize: "0.78rem",
          fontWeight: 300,
          letterSpacing: "0.04em",
        },
      },
    },

    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontFamily: '"Jost", sans-serif',
          fontWeight: 400,
          letterSpacing: "0.04em",
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          fontFamily: '"Jost", sans-serif',
          border: `1px solid ${
            theme.palette.mode === "light"
              ? "rgba(10, 112, 128, 0.14)"
              : "rgba(20, 163, 180, 0.14)"
          }`,
          borderRadius: 8,
          "& .MuiDataGrid-columnHeader": {
            fontWeight: 600,
            fontSize: "0.68rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: theme.palette.mode === "light" ? "#0A7080" : "#4ECBD8",
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.04)"
                : "rgba(20, 163, 180, 0.04)",
          },
          "& .MuiDataGrid-cell": {
            fontWeight: 300,
            fontSize: "0.86rem",
            borderBottomColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.08)"
                : "rgba(20, 163, 180, 0.08)",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.04)"
                : "rgba(20, 163, 180, 0.05)",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTopColor:
              theme.palette.mode === "light"
                ? "rgba(10, 112, 128, 0.12)"
                : "rgba(20, 163, 180, 0.12)",
            fontFamily: '"Jost", sans-serif',
            fontSize: "0.8rem",
          },
        }),
      },
    },
  },
});

export default getDesignTokens;
