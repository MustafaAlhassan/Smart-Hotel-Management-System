import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Stack,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import api from "../services/api";

interface IUserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

const getRoleColor = (
  role: string,
): "primary" | "secondary" | "warning" | "success" | "default" => {
  if (role === "ADMIN") return "success";
  if (role === "MANAGER") return "primary";
  if (role === "RECEPTIONIST") return "secondary";
  if (role === "HOUSEKEEPING") return "warning";
  return "default";
};

const getAvatarColor = (name: string) => {
  const colors = [
    "#5C6BC0",
    "#26A69A",
    "#EF5350",
    "#AB47BC",
    "#FFA726",
    "#42A5F5",
    "#66BB6A",
    "#EC407A",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
};

const SectionCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        mb: 3,
      }}
    >
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          py: 2.5,
          bgcolor: theme.palette.action.hover,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "white",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 3, md: 4 }, py: 3 }}>{children}</Box>
    </Paper>
  );
};

const SettingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const getUserIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userId = getUserIdFromToken();
      if (!userId) {
        showSnackbar("Unable to identify current user", "error");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/auth/${userId}`);
        const user: IUserProfile = res.data;
        setProfile(user);
        setProfileForm({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
        });
      } catch (err: any) {
        const message = err.response?.data?.error || "Failed to load profile";
        if (
          !message.toLowerCase().includes("access denied") &&
          !message.toLowerCase().includes("permission")
        ) {
          showSnackbar(message, "error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setProfileLoading(true);
    try {
      const res = await api.put(`/auth/${profile._id}`, profileForm);
      const updated = res.data.user;
      setProfile({ ...profile, ...updated });
      setProfileForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
        email: updated.email,
      });
      showSnackbar("Profile updated successfully", "success");
      setProfileEditing(false);
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.error || "Failed to update profile",
        "error",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setProfileForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
    });
    setProfileEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar("New passwords do not match", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showSnackbar("Password must be at least 6 characters", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      showSnackbar("Password changed successfully", "success");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.error || "Failed to change password",
        "error",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress
          sx={{ color: theme.palette.primary.main }}
          size={52}
          thickness={4}
        />
      </Box>
    );
  }

  const initials = profile
    ? `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  const avatarBg = profile ? getAvatarColor(profile.username) : "#999";

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-end" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing={-0.5}
            sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
          >
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage your account profile and security
          </Typography>
        </Box>
      </Box>

      {profile && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            p: { xs: 2.5, md: 3 },
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2.5,
          }}
        >
          <Avatar
            sx={{
              bgcolor: avatarBg,
              width: { xs: 56, md: 68 },
              height: { xs: 56, md: 68 },
              fontSize: { xs: "1.3rem", md: "1.6rem" },
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="h6" fontWeight={800}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Chip
                label={profile.role}
                size="small"
                color={getRoleColor(profile.role)}
                sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: "0.7rem" }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              @{profile.username} · {profile.email}
            </Typography>
          </Box>
        </Paper>
      )}

      {profile?.role?.toUpperCase() === "ADMIN" && (
        <SectionCard
          icon={<PersonIcon sx={{ fontSize: 18 }} />}
          title="Profile Information"
          subtitle="Update your name, username and email"
        >
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First Name"
                fullWidth
                disabled={!profileEditing}
                value={profileForm.firstName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, firstName: e.target.value })
                }
              />
              <TextField
                label="Last Name"
                fullWidth
                disabled={!profileEditing}
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, lastName: e.target.value })
                }
              />
            </Stack>
            <TextField
              label="Username"
              fullWidth
              disabled={!profileEditing}
              value={profileForm.username}
              onChange={(e) =>
                setProfileForm({ ...profileForm, username: e.target.value })
              }
            />
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              disabled={!profileEditing}
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
            />

            <Box
              display="flex"
              justifyContent="flex-end"
              gap={1.5}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              {!profileEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setProfileEditing(true)}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    color="inherit"
                    sx={{
                      fontWeight: 600,
                      textTransform: "none",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={profileLoading ? null : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      px: 3,
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {profileLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </>
              )}
            </Box>
          </Stack>
        </SectionCard>
      )}

      <SectionCard
        icon={<LockIcon sx={{ fontSize: 18 }} />}
        title="Change Password"
        subtitle="Enter your current password to set a new one"
      >
        <Stack spacing={3}>
          <TextField
            label="Current Password"
            type={showOld ? "text" : "password"}
            fullWidth
            value={passwordForm.oldPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowOld(!showOld)}
                    edge="end"
                  >
                    {showOld ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="New Password"
              type={showNew ? "text" : "password"}
              fullWidth
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              helperText="At least 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowNew(!showNew)}
                      edge="end"
                    >
                      {showNew ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              error={
                !!passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword
              }
              helperText={
                passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword
                  ? "Passwords do not match"
                  : " "
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirm(!showConfirm)}
                      edge="end"
                    >
                      {showConfirm ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
              disabled={
                passwordLoading ||
                !passwordForm.oldPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                px: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {passwordLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                "Update Password"
              )}
            </Button>
          </Box>
        </Stack>
      </SectionCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
