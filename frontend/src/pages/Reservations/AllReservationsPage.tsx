import React, { useEffect, useState } from "react";
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
  Chip,
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
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import HotelIcon from "@mui/icons-material/Hotel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AllReservationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    status: "",
    totalPrice: 0,
    notes: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const showMessage = (msg: string, sev: "success" | "error" = "success") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setBookings(data);
    } catch (err) {
      showMessage("Failed to load reservations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ------------------------------------------------------------------
  //  LOGIC PORTED FROM BOOKING PAGE
  // ------------------------------------------------------------------
  const calculateTotal = (booking: any) => {
    // 1. If the backend already saved the final total, return it.
    if (booking.totalPrice && booking.totalPrice > 0) return booking.totalPrice;

    // 2. Otherwise, calculate it dynamically using BookingPage logic
    const room = booking.room;

    // Get Price Per Night (supports basePrice or nested roomType)
    const pricePerNight = room?.basePrice || room?.roomType?.basePrice || 0;

    // Calculate Nights
    if (!booking.checkInDate || !booking.checkOutDate) return 0;

    const start = new Date(booking.checkInDate);
    const end = new Date(booking.checkOutDate);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const nights = diff > 0 ? diff : 0;

    // Return Total
    return nights * pricePerNight;
  };
  // ------------------------------------------------------------------

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await api.delete(`/bookings/${id}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b)),
      );
      showMessage("Booking cancelled successfully.");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Error cancelling booking.";
      showMessage(errorMsg, "error");
    }
  };

  const handleEditClick = (booking: any) => {
    setCurrentBooking(booking);

    // We also use the calculator here so the edit modal shows the correct price initially
    const calculatedPrice = calculateTotal(booking);

    setEditFormData({
      checkInDate: booking.checkInDate ? booking.checkInDate.split("T")[0] : "",
      checkOutDate: booking.checkOutDate
        ? booking.checkOutDate.split("T")[0]
        : "",
      status: booking.status || "Confirmed",
      totalPrice: calculatedPrice,
      notes: booking.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setCurrentBooking(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!currentBooking) return;

    try {
      const response = await api.put(
        `/bookings/${currentBooking._id}`,
        editFormData,
      );
      const updatedBooking = response.data.data || response.data;

      setBookings((prev) =>
        prev.map((b) => (b._id === currentBooking._id ? updatedBooking : b)),
      );
      showMessage("Booking updated successfully.");
      handleEditClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error updating booking.";
      showMessage(errorMsg, "error");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const guestName =
      `${booking.guest?.firstName || ""} ${booking.guest?.lastName || ""}`.toLowerCase();
    const roomNumber = booking.room?.roomNumber?.toString() || "";
    const email = booking.guest?.email || "";

    return (
      guestName.includes(searchTerm.toLowerCase()) ||
      roomNumber.includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusChip = (status: string) => {
    const s = status?.toLowerCase();
    const config: any = {
      confirmed: { color: "success", label: "Confirmed" },
      pending: { color: "warning", label: "Pending" },
      cancelled: { color: "error", label: "Cancelled" },
      "checked-in": { color: "info", label: "Checked In" },
      "checked-out": { color: "default", label: "Checked Out" },
      default: { color: "default", label: status || "Unknown" },
    };
    const current = config[s] || config.default;
    return (
      <Chip
        label={current.label}
        color={current.color}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>
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
        <Typography
          variant="h4"
          fontWeight="800"
          sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
        >
          Reservations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/reservations/new")}
          sx={{
            borderRadius: "10px",
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontSize: "1rem",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          New Booking
        </Button>
      </Box>

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
          placeholder="Search by guest name, email or room number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 10,
          }}
        >
          <CircularProgress size={50} />
        </Box>
      ) : isMobile ? (
        <Box>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              const totalPrice = calculateTotal(booking); // Calculate here

              return (
                <Card
                  key={booking._id}
                  sx={{ mb: 2, borderRadius: "12px", boxShadow: 2 }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </Typography>
                      {getStatusChip(booking.status)}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon
                          fontSize="small"
                          color="action"
                          sx={{ opacity: 0.6 }}
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <HotelIcon
                          fontSize="small"
                          color="action"
                          sx={{ opacity: 0.6 }}
                        />
                        <Typography variant="body2" fontWeight="500">
                          Room {booking.room?.roomNumber || "N/A"}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <EventIcon
                          fontSize="small"
                          color="action"
                          sx={{ opacity: 0.6 }}
                        />
                        <Typography variant="body2">
                          {new Date(booking.checkInDate).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoneyIcon
                          fontSize="small"
                          color="action"
                          sx={{ opacity: 0.6 }}
                        />
                        <Typography
                          variant="subtitle1"
                          color="primary.main"
                          fontWeight="bold"
                        >
                          ${totalPrice}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      display="flex"
                      justifyContent="flex-end"
                      mt={2}
                      gap={1}
                    >
                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditClick(booking)}
                        sx={{ borderRadius: "8px" }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancelBooking(booking._id)}
                        sx={{ borderRadius: "8px" }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Paper
              sx={{ p: 4, textAlign: "center", borderRadius: "12px" }}
              elevation={0}
            >
              <Typography color="text.secondary">
                No reservations found.
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                  Guest Information
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Check In / Out
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total Price</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const totalPrice = calculateTotal(booking); // Calculate here

                  return (
                    <TableRow
                      key={booking._id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "700" }}
                        >
                          {booking.guest?.firstName} {booking.guest?.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: "500" }}>
                          Room {booking.room?.roomNumber || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(booking.checkInDate).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          color="primary.main"
                          sx={{ fontWeight: "bold" }}
                        >
                          ${totalPrice}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            color="info"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => handleEditClick(booking)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel Booking">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary">
                      No reservations found matching your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Reservation</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Check-in Date"
                  type="date"
                  fullWidth
                  name="checkInDate"
                  value={editFormData.checkInDate}
                  onChange={handleEditChange}
                  sx={{ width: "250px" }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Check-out Date"
                  type="date"
                  fullWidth
                  name="checkOutDate"
                  sx={{ width: "250px" }}
                  value={editFormData.checkOutDate}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  name="status"
                  sx={{ width: "250px" }}
                  value={editFormData.status}
                  onChange={handleEditChange}
                >
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Checked-In">Checked-In</MenuItem>
                  <MenuItem value="Checked-Out">Checked-Out</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ width: "250px" }}
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            sx={{ px: 4 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllReservationsPage;
