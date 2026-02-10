import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StatisPage from "./pages/StatisPage";
import BillPage from "./pages/BillPage";
import ReservationsPage from "./pages/ReservationsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout";
import React, { useState } from "react";
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  type PaletteMode,
} from "@mui/material";
import getDesignTokens from "./theme/MyTheme";
import RoomsPage from "./pages/RoomsManagement/Rooms";
import RoomTypesPage from "./pages/RoomsManagement/RoomType";
const sidebarWidth = 240;

function App() {
  // Start Theme
  const [mode, setMyMode] = useState<PaletteMode>(
    localStorage.getItem("currentMode") === null
      ? "light"
      : localStorage.getItem("currentMode") === "light"
        ? "light"
        : "dark",
  );

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  // End Theme

  // Start Drawer

  // End Drawer

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <Layout setMyMode={setMyMode} sidebarWidth={sidebarWidth} />
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/statistics" element={<StatisPage />} />
              <Route path="/billing" element={<BillPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/room-types" element={<RoomTypesPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
