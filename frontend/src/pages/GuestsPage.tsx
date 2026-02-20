import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import api from "../services/api";

const GuestsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [formData, setFormData] = useState({
    idNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showMessage = (msg: string, sev: "success" | "error" = "success") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/guests", {
        params: { page, limit: 10, search: searchTerm },
      });
      if (response.data) {
        setGuests(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      showMessage(
        err.response?.data?.message || "Error fetching guests",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleOpenDialog = (guest: any = null) => {
    if (guest) {
      setSelectedGuest(guest);
      setFormData({
        idNumber: guest.idNumber,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phoneNumber: guest.phoneNumber,
        address: guest.address || "",
      });
    } else {
      setSelectedGuest(null);
      setFormData({
        idNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
      });
    }
    setOpenDialog(true);
  };

  const handleSaveGuest = async () => {
    try {
      if (selectedGuest) {
        await api.put(`/guests/${selectedGuest._id}`, formData);
        showMessage("Guest updated successfully");
      } else {
        await api.post("/guests", formData);
        showMessage("Guest added successfully");
      }
      setOpenDialog(false);
      fetchGuests();
    } catch (err: any) {
      showMessage(err.response?.data?.message || "Error saving guest", "error");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) return;
    try {
      await api.delete(`/guests/${id}`);
      showMessage("Guest deleted successfully");
      fetchGuests();
    } catch (err: any) {
      showMessage("Error deleting guest", "error");
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 4,
          width: "100%",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
          >
            Guest Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your hotel guest database
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: "10px",
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: "bold",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Add New Guest
        </Button>
      </Box>

      {/* Search Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, email or ID number..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            sx: { borderRadius: "10px" },
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
          <CircularProgress size={50} />
        </Box>
      ) : isMobile ? (
        /* Mobile Card View */
        <Box>
          {guests.map((guest) => (
            <Card
              key={guest._id}
              sx={{ mb: 2, borderRadius: "12px", boxShadow: 2 }}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {guest.firstName} {guest.lastName}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleOpenDialog(guest)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteGuest(guest._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BadgeIcon
                      fontSize="small"
                      color="action"
                      sx={{ opacity: 0.7 }}
                    />
                    <Typography variant="body2">
                      ID: {guest.idNumber}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon
                      fontSize="small"
                      color="action"
                      sx={{ opacity: 0.7 }}
                    />
                    <Typography variant="body2">{guest.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon
                      fontSize="small"
                      color="action"
                      sx={{ opacity: 0.7 }}
                    />
                    <Typography variant="body2">{guest.phoneNumber}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <HomeIcon
                      fontSize="small"
                      color="action"
                      sx={{ opacity: 0.7 }}
                    />
                    <Typography variant="body2" noWrap>
                      {guest.address || "No address"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            width: "100%",
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                <TableCell sx={{ fontWeight: "bold" }}>Guest Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ID Number</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guests.length > 0 ? (
                guests.map((guest) => (
                  <TableRow key={guest._id} hover>
                    <TableCell sx={{ fontWeight: "700" }}>
                      {guest.firstName} {guest.lastName}
                    </TableCell>
                    <TableCell>{guest.idNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{guest.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {guest.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, noWrap: true }}>
                      <Typography variant="body2" noWrap>
                        {guest.address || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleOpenDialog(guest)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteGuest(guest._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    No guests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
          shape="rounded"
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {selectedGuest ? "Edit Guest Profile" : "Register New Guest"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sx={{ width: "268px" }}>
              <TextField
                fullWidth
                label="ID / Passport Number"
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: "268px" }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: "268px" }}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sx={{ width: "268px" }}>
              <TextField
                fullWidth
                label="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sx={{ width: "268px" }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sx={{ width: "268px" }}>
              <TextField
                fullWidth
                multiline
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveGuest} variant="contained" sx={{ px: 4 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: "8px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GuestsPage;
