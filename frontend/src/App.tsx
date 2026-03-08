import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InvoicesPage from "./pages/InvoicesPage";
import BookingPage from "./pages/Reservations/BookingPage";
import AllReservationsPage from "./pages/Reservations/AllReservationsPage";
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
import RoomsPage from "./pages/RoomsManagement/RoomsPage";
import RoomTypesPage from "./pages/RoomsManagement/RoomTypePage";
import GuestsPage from "./pages/GuestsPage";
import ServicesPage from "./pages/ServicesPage";
import { HotelProvider } from "./context/HotelContext";

const sidebarWidth = 290;

function App() {
  const [mode, setMyMode] = useState<PaletteMode>(
    localStorage.getItem("currentMode") === null
      ? "light"
      : localStorage.getItem("currentMode") === "light"
        ? "light"
        : "dark",
  );

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HotelProvider>
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
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/room-types" element={<RoomTypesPage />} />
                <Route
                  path="/all-reservations"
                  element={<AllReservationsPage />}
                />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/guests" element={<GuestsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </HotelProvider>
    </ThemeProvider>
  );
}

export default App;
