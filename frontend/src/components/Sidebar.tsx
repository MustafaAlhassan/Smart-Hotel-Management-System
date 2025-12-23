import { Avatar, Divider, Drawer, useTheme } from "@mui/material";
import List from "@mui/material/List";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useLocation, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CreateIcon from "@mui/icons-material/Create";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box } from "@mui/system";
import Logo from "../assets/Logo.png";
// Start Ibrhaim Work
interface SidebarProps {
  sidebarWidth: number;
  noneORblock: string;
  drawereType: string;
  setDrawerType: React.Dispatch<React.SetStateAction<string>>;
  setnoneORblock: React.Dispatch<React.SetStateAction<string>>;
}
// End Ibrhaim Work

const Sidebar = ({
  sidebarWidth,
  noneORblock,
  drawereType,
  setDrawerType,
  setnoneORblock,
}: SidebarProps) => {
  // Start Mustafa Work
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // End Mustafa Work

  // Start Ibrahim Work
  const theme = useTheme();
  const currentLocation = useLocation();
  const myList = [
    { text: "Dahsboard", icon: <HomeIcon />, path: "/dashboard" },
    { text: "Statistics", icon: <CreateIcon />, path: "/statistics" },
    { text: "Billing", icon: <AccountCircleIcon />, path: "/billing" },
    { text: "Users", icon: <SettingsIcon />, path: "/users" },
    { text: "Reservations", icon: <SettingsIcon />, path: "/reservations" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  // End Ibrahim Work

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
          {myList.map((item) => {
            return (
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
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}

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
