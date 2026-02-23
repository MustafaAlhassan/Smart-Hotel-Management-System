import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  InputBase,
  MenuItem,
  Menu,
  Avatar,
  Typography,
  Divider,
  Chip,
  Tooltip,
  useTheme,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
  type PaletteMode,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CategoryIcon from "@mui/icons-material/Category";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";

interface NavbarProps {
  setMyMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
  sidebarWidth: number;
  setDrawerType: React.Dispatch<React.SetStateAction<string>>;
  setnoneORblock: React.Dispatch<React.SetStateAction<string>>;
}

const ALL_PAGES = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    label: "All Rooms",
    path: "/rooms",
    icon: <MeetingRoomIcon fontSize="small" />,
  },
  {
    label: "Room Types",
    path: "/room-types",
    icon: <CategoryIcon fontSize="small" />,
  },
  {
    label: "All Reservations",
    path: "/all-reservations",
    icon: <BookOnlineIcon fontSize="small" />,
  },
  {
    label: "New Booking",
    path: "/booking",
    icon: <BookOnlineIcon fontSize="small" />,
  },
  {
    label: "Guests",
    path: "/guests",
    icon: <PersonAddIcon fontSize="small" />,
  },
  {
    label: "Services",
    path: "/services",
    icon: <RoomServiceIcon fontSize="small" />,
  },
  {
    label: "Invoices",
    path: "/invoices",
    icon: <DescriptionIcon fontSize="small" />,
  },
  { label: "Users", path: "/users", icon: <GroupIcon fontSize="small" /> },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsIcon fontSize="small" />,
  },
];

const ROLE_COLOR: Record<
  string,
  "success" | "primary" | "secondary" | "warning" | "default"
> = {
  ADMIN: "success",
  MANAGER: "primary",
  RECEPTIONIST: "secondary",
  HOUSEKEEPING: "warning",
};

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "10px",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  transition: "border-color 0.2s, box-shadow 0.2s",
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
  },
  width: "100%",
  maxWidth: 520,
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
  },
}));

const SearchIconWrap = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.disabled,
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  width: "100%",
  color: theme.palette.text.primary,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 4.5, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(2.5)})`,
    fontSize: "0.875rem",
    width: "100%",
  },
}));

const Navbar = ({
  setMyMode,
  sidebarWidth,
  setDrawerType,
  setnoneORblock,
}: NavbarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem("username") || "User";
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const isDark = theme.palette.mode === "dark";
  const initials = username[0]?.toUpperCase() ?? "U";

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const openMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const [query, setQuery] = React.useState("");
  const [showResults, setShowResults] = React.useState(false);

  const filtered =
    query.trim().length > 0
      ? ALL_PAGES.filter((p) =>
          p.label.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setQuery("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
  };

  const handleToggleTheme = () => {
    const next = isDark ? "light" : "dark";
    localStorage.setItem("currentMode", next);
    setMyMode(next);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
    closeMenu();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${sidebarWidth}px)` },
          ml: { sm: `${sidebarWidth}px` },
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          zIndex: theme.zIndex.drawer - 1,
        }}
      >
        <Toolbar
          sx={{
            gap: 1.5,
            minHeight: { xs: 60, sm: 80 },
            px: { xs: 1.5, sm: 3 },
          }}
        >
          <IconButton
            onClick={() => {
              setDrawerType("temporary");
              setnoneORblock("block");
            }}
            size="small"
            sx={{
              display: { sm: "none" },
              color: theme.palette.text.secondary,
              flexShrink: 0,
            }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>

          <ClickAwayListener onClickAway={() => setShowResults(false)}>
            <Box
              sx={{
                flex: 1,
                maxWidth: 550,
                minWidth: 200,
                position: "relative",
              }}
            >
              <SearchWrapper>
                <SearchIconWrap>
                  <SearchIcon sx={{ fontSize: 18 }} />
                </SearchIconWrap>
                <StyledInput
                  placeholder="Search pages…"
                  value={query}
                  inputProps={{ "aria-label": "search" }}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => {
                    if (query) setShowResults(true);
                  }}
                  endAdornment={
                    query ? (
                      <IconButton
                        size="small"
                        onClick={clearSearch}
                        sx={{ mr: 0.5, color: "text.disabled" }}
                      >
                        <CloseIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    ) : null
                  }
                />
              </SearchWrapper>

              {showResults && filtered.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 1400,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.disabled"
                    sx={{
                      px: 2,
                      pt: 1.2,
                      pb: 0.5,
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontSize: "0.65rem",
                    }}
                  >
                    Pages
                  </Typography>
                  <List dense disablePadding sx={{ pb: 0.5 }}>
                    {filtered.map((page) => (
                      <ListItemButton
                        key={page.path}
                        selected={location.pathname === page.path}
                        onClick={() => handleSearchSelect(page.path)}
                        sx={{
                          mx: 0.5,
                          borderRadius: 1.5,
                          py: 0.9,
                          "&.Mui-selected": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            "& .MuiListItemIcon-root": {
                              color: theme.palette.primary.main,
                            },
                            "& .MuiListItemText-primary": {
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {page.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={page.label}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}

              {showResults &&
                query.trim().length > 0 &&
                filtered.length === 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      zIndex: 1400,
                      borderRadius: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
                      py: 2.5,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No pages found for "
                      <Box component="span" fontWeight={700}>
                        {query}
                      </Box>
                      "
                    </Typography>
                  </Paper>
                )}
            </Box>
          </ClickAwayListener>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <IconButton
              onClick={handleToggleTheme}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                p: 0.8,
                transition: "all 0.15s",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
              }}
            >
              {isDark ? (
                <Brightness7Icon sx={{ fontSize: 18, color: "orange" }} />
              ) : (
                <Brightness4Icon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          <Box
            onClick={openMenu}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pl: { xs: 0.6, sm: 1 },
              pr: { xs: 0.6, sm: 1.2 },
              py: 0.6,
              borderRadius: "10px",
              cursor: "pointer",
              border: `1px solid ${theme.palette.divider}`,
              transition: "all 0.15s",
              userSelect: "none",
              flexShrink: 0,
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Avatar
              sx={{
                width: 33,
                height: 33,
                fontSize: "0.72rem",
                fontWeight: 800,
                bgcolor: theme.palette.primary.main,
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block", width: "90px" } }}>
              <Typography
                variant="body2"
                fontWeight={700}
                lineHeight={1.2}
                noWrap
                sx={{ maxWidth: 120 }}
              >
                {username}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                lineHeight={1}
                sx={{ fontSize: "0.65rem" }}
              >
                {role}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 16,
                color: "text.secondary",
                display: { xs: "none", sm: "flex" },
                transition: "transform 0.2s",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            minWidth: 215,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "0.85rem",
                fontWeight: 800,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={800} lineHeight={1.2}>
                {username}
              </Typography>
              {role && (
                <Chip
                  label={role}
                  size="small"
                  color={ROLE_COLOR[role] ?? "default"}
                  sx={{
                    height: 17,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    borderRadius: 1,
                    mt: 0.3,
                    "& .MuiChip-label": { px: 0.7 },
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            handleToggleTheme();
            closeMenu();
          }}
          sx={{ gap: 1.5, py: 1.1, mx: 0.5, borderRadius: 1.5 }}
        >
          {isDark ? (
            <Brightness7Icon fontSize="small" sx={{ color: "orange" }} />
          ) : (
            <Brightness4Icon fontSize="small" color="action" />
          )}
          <Typography variant="body2" fontWeight={600}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/settings");
            closeMenu();
          }}
          sx={{ gap: 1.5, py: 1.1, mx: 0.5, borderRadius: 1.5 }}
        >
          <SettingsIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>
            Settings
          </Typography>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            gap: 1.5,
            py: 1.1,
            mx: 0.5,
            borderRadius: 1.5,
            "&:hover": { bgcolor: `${theme.palette.error.main}14` },
          }}
        >
          <LogoutIcon fontSize="small" color="error" />
          <Typography variant="body2" fontWeight={600} color="error">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Navbar;
