import { Outlet, Navigate } from "react-router-dom";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedLayout;
