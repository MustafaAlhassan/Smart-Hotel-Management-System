import { Avatar, Divider, Drawer, useTheme, Collapse } from "@mui/material";
import List from "@mui/material/List";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useLocation, useNavigate } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box } from "@mui/system";
import Logo from "../assets/Logo.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import NightShelterIcon from "@mui/icons-material/NightShelter";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CategoryIcon from "@mui/icons-material/Category";
import ListAltIcon from "@mui/icons-material/ListAlt"; // أيقونة لقائمة الحجوزات
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // أيقونة لحجز جديد
import React, { useState } from "react";

interface SidebarProps {
  sidebarWidth: number;
  noneORblock: string;
  drawereType: any;
  setDrawerType: React.Dispatch<React.SetStateAction<string>>;
  setnoneORblock: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar = ({
  sidebarWidth,
  noneORblock,
  drawereType,
  setDrawerType,
  setnoneORblock,
}: SidebarProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const currentLocation = useLocation();

  const [roomsOpen, setRoomsOpen] = useState(false);
  const [reservationsOpen, setReservationsOpen] = useState(false); // الحالة الجديدة لقسم الحجوزات

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const myList = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  ];

  const bottomList = [
    { text: "Billing", icon: <DescriptionIcon />, path: "/billing" },
    { text: "Users", icon: <GroupIcon />, path: "/users" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  return (
    <>
      <Drawer
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            display: { xs: noneORblock, sm: "block" },
          },
        }}
        variant={drawereType}
        anchor="left"
        open={true}
        onClose={() => {
          setnoneORblock("none");
          setDrawerType("permanent");
        }}
      >
        <Box
          sx={{
            mt: "17px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: "7px",
          }}
        >
          <Avatar src={Logo} variant="square"></Avatar>
        </Box>
        <Divider />

        <List sx={{ mt: "30px" }}>
          {/* Dashboard */}
          {myList.map((item) => (
            <ListItem
              key={item.text}
              sx={{
                bgcolor:
                  currentLocation.pathname === item.path
                    ? theme.palette.primary.main
                    : null,
              }}
              disablePadding
            >
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Rooms Management (Expandable) */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setRoomsOpen(!roomsOpen)}>
              <ListItemIcon>
                <NightShelterIcon />
              </ListItemIcon>
              <ListItemText primary="Rooms Management" />
              {roomsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={roomsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{
                  pl: 4,
                  bgcolor:
                    currentLocation.pathname === "/rooms"
                      ? "rgba(0, 0, 0, 0.04)"
                      : null,
                }}
                onClick={() => navigate("/rooms")}
              >
                <ListItemIcon>
                  <MeetingRoomIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Rooms" />
              </ListItemButton>

              <ListItemButton
                sx={{
                  pl: 4,
                  bgcolor:
                    currentLocation.pathname === "/room-types"
                      ? "rgba(0, 0, 0, 0.04)"
                      : null,
                }}
                onClick={() => navigate("/room-types")}
              >
                <ListItemIcon>
                  <CategoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Room Types" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Reservations Management (Expandable) - القسم الجديد */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setReservationsOpen(!reservationsOpen)}
            >
              <ListItemIcon>
                <BookOnlineIcon />
              </ListItemIcon>
              <ListItemText primary="Reservations" />
              {reservationsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={reservationsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* خيار عرض كل الحجوزات */}
              <ListItemButton
                sx={{
                  pl: 4,
                  bgcolor:
                    currentLocation.pathname === "/reservations"
                      ? "rgba(0, 0, 0, 0.04)"
                      : null,
                }}
                onClick={() => navigate("/all-reservations")}
              >
                <ListItemIcon>
                  <ListAltIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="All Reservations" />
              </ListItemButton>

              <ListItemButton
                sx={{
                  pl: 4,
                  bgcolor:
                    currentLocation.pathname === "/reservations"
                      ? "rgba(0, 0, 0, 0.04)"
                      : null,
                }}
                onClick={() => navigate("/booking")}
              >
                <ListItemIcon>
                  <AddCircleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="New Booking" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Other List Items */}
          {bottomList.map((item) => (
            <ListItem
              key={item.text}
              sx={{
                bgcolor:
                  currentLocation.pathname === item.path
                    ? theme.palette.primary.main
                    : null,
              }}
              disablePadding
            >
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
