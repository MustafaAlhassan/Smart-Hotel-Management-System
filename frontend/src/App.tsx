import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProductedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StatisPage from "./pages/StatisPage";
import BillPage from "./pages/BillPage";
import ReservationsPage from "./pages/ReservationsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/statistics" element={<StatisPage />} />
          <Route path="/billing" element={<BillPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
