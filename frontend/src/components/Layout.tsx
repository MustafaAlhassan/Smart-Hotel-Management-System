import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import type { PaletteMode } from "@mui/material";

interface LayoutProps {
  setMyMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
}

export const Layout = ({ setMyMode }: LayoutProps) => {
  return (
    <>
      <Navbar setMyMode={setMyMode} />
      <Sidebar />
      <Outlet />
    </>
  );
};

export default Layout;
