import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const ProtectedLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="content-area">
        <Sidebar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
