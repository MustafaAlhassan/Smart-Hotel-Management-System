import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Menu,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Stack,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  MoreVert,
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";
import api from "../services/api";

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

const roles = ["MANAGER", "RECEPTIONIST", "HOUSEKEEPING"];

const getRoleColor = (
  role: string,
): "primary" | "secondary" | "warning" | "default" => {
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

const UsersPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "MANAGER",
  });
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/");
      setUsers(response.data);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.error || "Failed to fetch users",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: IUser,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleSaveUser = async () => {
    setActionLoading(true);
    try {
      if (selectedUser) {
        await api.put(`/auth/${selectedUser._id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
        });
        showSnackbar("User updated successfully", "success");
      } else {
        await api.post("/auth/create-user", formData);
        showSnackbar("User created successfully", "success");
      }
      setOpenUserDialog(false);
      fetchUsers();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.error || "Failed to save user",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.delete(`/auth/${selectedUser._id}`);
      showSnackbar("User deleted successfully", "success");
      setOpenDeleteDialog(false);
      fetchUsers();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.error || "Failed to delete user",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    setActionLoading(true);
    try {
      await api.patch(`/auth/${selectedUser._id}/role`, { newRole });
      showSnackbar("Role updated successfully", "success");
      setOpenRoleDialog(false);
      fetchUsers();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.error || "Failed to update role",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    setActionLoading(true);
    try {
      await api.patch(`/auth/${selectedUser._id}/reset-password`, {
        newPassword,
      });
      showSnackbar("Password reset successfully", "success");
      setOpenPasswordDialog(false);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.error || "Failed to reset password",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      role: "MANAGER",
    });
    setOpenUserDialog(true);
  };

  const openEditDialog = () => {
    if (selectedUser) {
      setFormData({ ...selectedUser, password: "" });
      setOpenUserDialog(true);
    }
    handleMenuClose();
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

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>
      {/* Header */}
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
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage staff accounts and access roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            px: 4,
            py: 1.2,
            textTransform: "none",
            boxShadow: "none",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Mobile Card View */}
      {isMobile ? (
        <Box>
          {users.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              py={5}
            >
              No users found. Click "Add User" to create one.
            </Typography>
          ) : (
            users.map((user) => {
              const initials =
                `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
              return (
                <Card
                  key={user._id}
                  sx={{ mb: 2, borderRadius: "12px", boxShadow: 2 }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(user.username),
                            width: 38,
                            height: 38,
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            lineHeight={1.2}
                          >
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, user)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon
                          fontSize="small"
                          sx={{ opacity: 0.55, fontSize: 16 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AdminIcon
                          fontSize="small"
                          sx={{ opacity: 0.55, fontSize: 16 }}
                        />
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            height: 22,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                {["Staff Member", "Username", "Email", "Role", "Actions"].map(
                  (h) => (
                    <TableCell
                      key={h}
                      align={h === "Actions" ? "right" : "left"}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "text.secondary",
                        py: 2,
                      }}
                    >
                      {h}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found. Click "Add User" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const initials =
                    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
                  return (
                    <TableRow
                      key={user._id}
                      sx={{
                        "&:last-child td": { border: 0 },
                        "&:hover": { bgcolor: theme.palette.action.hover },
                        transition: "background 0.15s",
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(user.username),
                              width: 34,
                              height: 34,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                            }}
                          >
                            {initials}
                          </Avatar>
                          <Typography variant="body2" fontWeight={700}>
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            fontSize: "0.7rem",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="More actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, user)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 190,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          },
        }}
      >
        <MenuItem onClick={openEditDialog} sx={{ gap: 1.5, py: 1.2 }}>
          <EditIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            Edit Details
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setNewRole(selectedUser?.role || "");
            setOpenRoleDialog(true);
            handleMenuClose();
          }}
          sx={{ gap: 1.5, py: 1.2 }}
        >
          <ManageAccountsIcon fontSize="small" color="secondary" />
          <Typography variant="body2" fontWeight={600}>
            Change Role
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setNewPassword("");
            setOpenPasswordDialog(true);
            handleMenuClose();
          }}
          sx={{ gap: 1.5, py: 1.2 }}
        >
          <LockResetIcon fontSize="small" color="warning" />
          <Typography variant="body2" fontWeight={600}>
            Reset Password
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setOpenDeleteDialog(true);
            handleMenuClose();
          }}
          sx={{ gap: 1.5, py: 1.2, color: "error.main" }}
        >
          <DeleteIcon fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            Delete User
          </Typography>
        </MenuItem>
      </Menu>

      {/* Create / Edit User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>
          {selectedUser ? "Edit User" : "Create New User"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First Name"
                fullWidth
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <TextField
                label="Last Name"
                fullWidth
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </Stack>
            <TextField
              label="Username"
              fullWidth
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {!selectedUser && (
              <>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <TextField
                  select
                  label="Role"
                  fullWidth
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  {roles.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenUserDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={actionLoading}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            {actionLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={openRoleDialog}
        onClose={() => setOpenRoleDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Change Role</DialogTitle>
        <DialogContent dividers>
          <Box pt={1}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Updating role for <strong>@{selectedUser?.username}</strong>
            </Typography>
            <TextField
              select
              label="New Role"
              fullWidth
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenRoleDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleChangeRole}
            disabled={actionLoading}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            {actionLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Update Role"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Reset Password</DialogTitle>
        <DialogContent dividers>
          <Box pt={1}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Setting new password for{" "}
              <strong>@{selectedUser?.username}</strong>
            </Typography>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenPasswordDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleResetPassword}
            disabled={!newPassword || actionLoading}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            {actionLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>@{selectedUser?.username}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={actionLoading}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {actionLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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

export default UsersPage;
