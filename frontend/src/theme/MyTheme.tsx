import { type PaletteMode } from "@mui/material";

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "dark"
      ? {
          // palette values for light mode
          common: {
            black: "#000",
            white: "#fff",
          },
          primary: {
            main: "rgba(0, 131, 143, 1)",
            light: "#4fb3bf",
            dark: "#005662",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "rgba(92, 107, 192, 1)",
            light: "#8e99f3",
            dark: "#26418f",
            contrastText: "#ffffff",
          },
          error: {
            main: "#d32f2f",
            light: "#ef5350",
            dark: "#c62828",
            contrastText: "#ffffff",
          },
          warning: {
            main: "#ed6c02",
            light: "#ff9800",
            dark: "#e65100",
            contrastText: "#ffffff",
          },
          info: {
            main: "#0288d1",
            light: "#03a9f4",
            dark: "#01579b",
            contrastText: "#ffffff",
          },
          success: {
            main: "#2e7d32",
            light: "#4caf50",
            dark: "#1b5e20",
            contrastText: "#ffffff",
          },
          text: {
            primary: "rgba(0, 0, 0, 0.87)",
            secondary: "rgba(0, 0, 0, 0.6)",
            disabled: "rgba(0, 0, 0, 0.38)",
          },
          background: {
            paper: "#ffffff",
            default: "#f5f7f8",
          },
          divider: "rgba(0, 0, 0, 0.12)",
        }
      : {
          // palette values for dark mode
          common: {
            black: "#000",
            white: "#fff",
          },
          primary: {
            main: "#4fb3bf",
            light: "#82e5ef",
            dark: "#00838f",
            contrastText: "rgba(0, 0, 0, 0.87)",
          },
          secondary: {
            main: "#9fa8da",
            light: "#d1d9ff",
            dark: "#6f79a8",
            contrastText: "rgba(0, 0, 0, 0.87)",
          },
          error: {
            main: "#f44336",
            light: "#e57373",
            dark: "#d32f2f",
            contrastText: "#fff",
          },
          warning: {
            main: "#ffa726",
            light: "#ffb74d",
            dark: "#f57c00",
            contrastText: "rgba(0, 0, 0, 0.87)",
          },
          info: {
            main: "#29b6f6",
            light: "#4fc3f7",
            dark: "#0288d1",
            contrastText: "rgba(0, 0, 0, 0.87)",
          },
          success: {
            main: "#66bb6a",
            light: "#81c784",
            dark: "#388e3c",
            contrastText: "rgba(0, 0, 0, 0.87)",
          },
          text: {
            primary: "#ffffff",
            secondary: "rgba(255, 255, 255, 0.7)",
            disabled: "rgba(255, 255, 255, 0.5)",
          },
          background: {
            default: "#0a1929",
            paper: "#112233",
          },
          divider: "rgba(255, 255, 255, 0.12)",
          darkModeOutline: {
            main: "#82e5ef",
          },
        }),
  },
});

export default getDesignTokens;
