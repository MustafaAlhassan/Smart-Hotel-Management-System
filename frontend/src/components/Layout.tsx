import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Box, type PaletteMode } from "@mui/material";
import { useState } from "react";

interface LayoutProps {
  setMyMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
  sidebarWidth: number;
}

export const Layout = ({ setMyMode, sidebarWidth }: LayoutProps) => {
  // Start Ibrhaim Work
  const [noneORblock, setnoneORblock] = useState("none");
  const [drawereType, setDrawerType] = useState("permanent");

  // Create functions for set better then send each one by props.

  // End Ibrhaim Work

  return (
    <>
      <Sidebar
        sidebarWidth={sidebarWidth}
        noneORblock={noneORblock}
        drawereType={drawereType}
        setDrawerType={setDrawerType}
        setnoneORblock={setnoneORblock}
      />
      <Navbar
        setMyMode={setMyMode}
        sidebarWidth={sidebarWidth}
        setDrawerType={setDrawerType}
        setnoneORblock={setnoneORblock}
      />
      <Box
        component="main"
        sx={{
          ml: { sm: `${sidebarWidth}px` },
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          mt: "66px",
          mb: "66px",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;
