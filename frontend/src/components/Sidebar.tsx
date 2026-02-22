import {
  Avatar,
  Divider,
  Drawer,
  useTheme,
  Collapse,
  Typography,
  Box,
} from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import NightShelterIcon from "@mui/icons-material/NightShelter";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CategoryIcon from "@mui/icons-material/Category";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import React, { useState } from "react";
import Logo from "../assets/Logo.png";

type UserRole = "ADMIN" | "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPING";

interface SidebarProps {
  sidebarWidth: number;
  noneORblock: string;
  drawereType: any;
  setDrawerType: React.Dispatch<React.SetStateAction<string>>;
  setnoneORblock: React.Dispatch<React.SetStateAction<string>>;
}

export const PAGE_ROLES: Record<string, UserRole[]> = {
  "/dashboard": ["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING"],
  "/rooms": ["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING"],
  "/room-types": ["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING"],
  "/all-reservations": ["ADMIN", "MANAGER", "RECEPTIONIST"],
  "/booking": ["ADMIN", "MANAGER", "RECEPTIONIST"],
  "/guests": ["ADMIN", "MANAGER", "RECEPTIONIST"],
  "/services": ["ADMIN", "MANAGER"],
  "/invoices": ["ADMIN", "MANAGER", "RECEPTIONIST"],
  "/users": ["ADMIN", "MANAGER"],
  "/settings": ["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING"],
};

export const canAccess = (path: string, role: string | null): boolean => {
  if (!role) return false;
  const allowed = PAGE_ROLES[path];
  if (!allowed) return true;
  const normalizedRole = role.toUpperCase() as UserRole;
  return allowed.includes(normalizedRole);
};

const ROLE_COLOR: Record<
  string,
  "success" | "primary" | "secondary" | "warning"
> = {
  ADMIN: "success",
  MANAGER: "primary",
  RECEPTIONIST: "secondary",
  HOUSEKEEPING: "warning",
};

const Sidebar = ({
  sidebarWidth,
  noneORblock,
  drawereType,
  setDrawerType,
  setnoneORblock,
}: SidebarProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  const role = localStorage.getItem("role") as UserRole | null;
  const username = localStorage.getItem("username") || "User";

  const [roomsOpen, setRoomsOpen] = useState(false);
  const [reservationsOpen, setReservationsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const allowed = (path: string) => canAccess(path, role);
  const isActive = (path: string) => location.pathname === path;

  const isRoomsGroupActive =
    location.pathname === "/rooms" || location.pathname === "/room-types";

  const isReservationsGroupActive =
    location.pathname === "/all-reservations" ||
    location.pathname === "/booking";

  const hasRoomsAccess = allowed("/rooms") || allowed("/room-types");
  const hasReservationsAccess =
    allowed("/all-reservations") || allowed("/booking");

  const TEXT_PROPS = { fontSize: "0.875rem", fontWeight: 600 } as const;
  const SUB_TEXT_PROPS = { fontSize: "0.82rem", fontWeight: 500 } as const;

  const navItemSx = (active: boolean) => ({
    borderRadius: "10px",
    mx: 1,
    mb: 0.5,
    transition: "background 0.15s",
    ...(active
      ? {
          bgcolor: theme.palette.primary.main,
          "& .MuiListItemIcon-root": { color: "#fff" },
          "& .MuiListItemText-primary": { color: "#fff", fontWeight: 700 },
          "&:hover": { bgcolor: theme.palette.primary.dark },
        }
      : {
          "& .MuiListItemIcon-root": { color: theme.palette.text.secondary },
          "&:hover": {
            bgcolor: theme.palette.action.hover,
            "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
          },
        }),
  });

  const groupItemSx = (open: boolean, groupActive: boolean) => ({
    borderRadius: "10px",
    mx: 1,
    mb: 0.5,
    transition: "background 0.15s",
    "& .MuiListItemIcon-root": {
      color:
        open || groupActive
          ? theme.palette.primary.main
          : theme.palette.text.secondary,
    },
    "& .MuiListItemText-primary": {
      fontWeight: open || groupActive ? 700 : 600,
    },
    "&:hover": {
      bgcolor: theme.palette.action.hover,
      "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
    },
  });

  const subItemSx = (active: boolean) => ({
    borderRadius: "10px",
    mx: 1,
    pl: 2.5,
    mb: 0.3,
    transition: "background 0.15s",
    ...(active
      ? {
          bgcolor: theme.palette.action.selected,
          "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.main,
            fontWeight: 700,
          },
        }
      : {
          "& .MuiListItemIcon-root": { color: theme.palette.text.disabled },
          "&:hover": {
            bgcolor: theme.palette.action.hover,
            "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
          },
        }),
  });

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.2,
          py: 2.2,
          px: 2,
          flexShrink: 0,
        }}
      >
        <Avatar
          src={Logo}
          variant="square"
          sx={{ width: 28, height: 28, borderRadius: 1 }}
        />
        <Typography
          variant="subtitle1"
          fontWeight={900}
          letterSpacing={-0.5}
          sx={{ userSelect: "none" }}
        >
          AMI Hotel
        </Typography>
      </Box>

      <Divider sx={{ mb: 0.5 }} />

      <List
        disablePadding
        sx={{
          mt: "20px",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 0.5,
          py: 0.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: theme.palette.divider,
            borderRadius: 4,
          },
        }}
      >
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/dashboard")}
            sx={navItemSx(isActive("/dashboard"))}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DashboardIcon sx={{ fontSize: 25 }} />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={TEXT_PROPS}
            />
          </ListItemButton>
        </ListItem>

        {hasRoomsAccess && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setRoomsOpen((v) => !v)}
                sx={groupItemSx(roomsOpen, isRoomsGroupActive)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <NightShelterIcon sx={{ fontSize: 25 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Rooms"
                  primaryTypographyProps={TEXT_PROPS}
                />
                {roomsOpen ? (
                  <ExpandLess sx={{ fontSize: 17, color: "text.secondary" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 17, color: "text.secondary" }} />
                )}
              </ListItemButton>
            </ListItem>
            <Collapse in={roomsOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {allowed("/rooms") && (
                  <ListItem disablePadding sx={{ ml: "25px" }}>
                    <ListItemButton
                      onClick={() => navigate("/rooms")}
                      sx={subItemSx(isActive("/rooms"))}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <MeetingRoomIcon sx={{ fontSize: 25 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="All Rooms"
                        primaryTypographyProps={SUB_TEXT_PROPS}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
                {allowed("/room-types") && (
                  <ListItem disablePadding sx={{ ml: "25px" }}>
                    <ListItemButton
                      onClick={() => navigate("/room-types")}
                      sx={subItemSx(isActive("/room-types"))}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CategoryIcon sx={{ fontSize: 25 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Room Types"
                        primaryTypographyProps={SUB_TEXT_PROPS}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </Collapse>
          </>
        )}

        {hasReservationsAccess && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setReservationsOpen((v) => !v)}
                sx={groupItemSx(reservationsOpen, isReservationsGroupActive)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <BookOnlineIcon sx={{ fontSize: 25 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Reservations"
                  primaryTypographyProps={TEXT_PROPS}
                />
                {reservationsOpen ? (
                  <ExpandLess sx={{ fontSize: 17, color: "text.secondary" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 17, color: "text.secondary" }} />
                )}
              </ListItemButton>
            </ListItem>
            <Collapse in={reservationsOpen} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ ml: "25px" }}>
                {allowed("/all-reservations") && (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => navigate("/all-reservations")}
                      sx={subItemSx(isActive("/all-reservations"))}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ListAltIcon sx={{ fontSize: 25 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="All Reservations"
                        primaryTypographyProps={SUB_TEXT_PROPS}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
                {allowed("/booking") && (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => navigate("/booking")}
                      sx={subItemSx(isActive("/booking"))}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <AddCircleOutlineIcon sx={{ fontSize: 25 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="New Booking"
                        primaryTypographyProps={SUB_TEXT_PROPS}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </Collapse>
          </>
        )}

        {allowed("/guests") && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/guests")}
              sx={navItemSx(isActive("/guests"))}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PersonAddIcon sx={{ fontSize: 25 }} />
              </ListItemIcon>
              <ListItemText
                primary="Guests"
                primaryTypographyProps={TEXT_PROPS}
              />
            </ListItemButton>
          </ListItem>
        )}

        {allowed("/services") && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/services")}
              sx={navItemSx(isActive("/services"))}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <RoomServiceIcon sx={{ fontSize: 25 }} />
              </ListItemIcon>
              <ListItemText
                primary="Services"
                primaryTypographyProps={TEXT_PROPS}
              />
            </ListItemButton>
          </ListItem>
        )}

        {allowed("/invoices") && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/invoices")}
              sx={navItemSx(isActive("/invoices"))}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DescriptionIcon sx={{ fontSize: 25 }} />
              </ListItemIcon>
              <ListItemText
                primary="Invoices"
                primaryTypographyProps={TEXT_PROPS}
              />
            </ListItemButton>
          </ListItem>
        )}

        {allowed("/users") && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/users")}
              sx={navItemSx(isActive("/users"))}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <GroupIcon sx={{ fontSize: 25 }} />
              </ListItemIcon>
              <ListItemText
                primary="Users"
                primaryTypographyProps={TEXT_PROPS}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider />
      <List disablePadding sx={{ px: 0.5, py: 1, flexShrink: 0 }}>
        <ListItem disablePadding sx={{ mt: "15px" }}>
          <ListItemButton
            onClick={() => navigate("/settings")}
            sx={navItemSx(isActive("/settings"))}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsIcon sx={{ fontSize: 25 }} />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={TEXT_PROPS}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: "25px" }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              mx: 1,
              transition: "background 0.15s",
              "& .MuiListItemIcon-root": { color: theme.palette.error.main },
              "&:hover": {
                bgcolor: `${theme.palette.error.main}18`,
                "& .MuiListItemIcon-root": { color: theme.palette.error.dark },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutIcon sx={{ fontSize: 25 }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                ...TEXT_PROPS,
                color: theme.palette.error.main,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarWidth,
          boxSizing: "border-box",
          display: { xs: noneORblock, sm: "block" },
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
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
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
