import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Chip,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import HotelIcon from "@mui/icons-material/Hotel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoginIcon from "@mui/icons-material/Login";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useHotel } from "../../context/HotelContext";

const ITEMS_PER_PAGE = 10;

const getAvatarColors = (name: string) => {
  const palette = [
    { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
    { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
    { bg: "#ede9fe", color: "#5b21b6", border: "#ddd6fe" },
    { bg: "#fce7f3", color: "#9d174d", border: "#fbcfe8" },
    { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
    { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
    { bg: "#fef9c3", color: "#854d0e", border: "#fef08a" },
    { bg: "#fdf2f8", color: "#86198f", border: "#f5d0fe" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

const GuestAvatar = ({
  firstName,
  lastName,
}: {
  firstName?: string;
  lastName?: string;
}) => {
  const first = firstName ?? "";
  const last = lastName ?? "";
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
  const colors = getAvatarColors(`${first}${last}`);
  return (
    <Avatar
      sx={{
        width: 34,
        height: 34,
        fontSize: "0.72rem",
        fontWeight: 700,
        bgcolor: colors.bg,
        color: colors.color,
        border: `1.5px solid ${colors.border}`,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </Avatar>
  );
};

const StatusChip = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  const configs: Record<
    string,
    { bg: string; color: string; border: string; dot: string; label: string }
  > = {
    confirmed: {
      bg: "#f0fdf4",
      color: "#15803d",
      border: "#bbf7d0",
      dot: "#22c55e",
      label: "Confirmed",
    },
    "checked-in": {
      bg: "#eff6ff",
      color: "#1d4ed8",
      border: "#bfdbfe",
      dot: "#3b82f6",
      label: "Checked In",
    },
    "checked-out": {
      bg: "#f8fafc",
      color: "#475569",
      border: "#e2e8f0",
      dot: "#94a3b8",
      label: "Checked Out",
    },
    cancelled: {
      bg: "#fef2f2",
      color: "#dc2626",
      border: "#fecaca",
      dot: "#ef4444",
      label: "Cancelled",
    },
  };
  const cfg = configs[s] ?? {
    bg: "#f8fafc",
    color: "#475569",
    border: "#e2e8f0",
    dot: "#94a3b8",
    label: status ?? "Unknown",
  };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1.25,
        py: 0.4,
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 700,
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </Box>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      alignItems: "center",
      gap: 2,
      flex: 1,
      minWidth: 0,
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2,
        bgcolor: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: iconColor,
      }}
    >
      {icon}
    </Box>
    <Box minWidth={0}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{
          fontSize: "0.68rem",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          display: "block",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        fontWeight={800}
        lineHeight={1.2}
        noWrap
        sx={{
          color: valueColor ?? "text.primary",
          fontSize: { xs: "1rem", md: "1.15rem" },
        }}
      >
        {value}
      </Typography>
    </Box>
  </Paper>
);

const DateRange = ({
  checkIn,
  checkOut,
}: {
  checkIn: string;
  checkOut: string;
}) => {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const nights = Math.max(
    0,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    ),
  );
  return (
    <Box>
      <Typography variant="body2" fontSize="0.82rem" lineHeight={1.4}>
        {fmt(checkIn)} → {fmt(checkOut)}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
        {nights} night{nights !== 1 ? "s" : ""}
      </Typography>
    </Box>
  );
};

const AllReservationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { hotel } = useHotel();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterCheckIn, setFilterCheckIn] = useState("");
  const [filterCheckOut, setFilterCheckOut] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({
    checkInDate: "",
    checkOutDate: "",
    status: "",
    room: "",
    totalPrice: 0,
    notes: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [moreInfoDialogOpen, setMoreInfoDialogOpen] = useState(false);
  const [moreInfoBooking, setMoreInfoBooking] = useState<any>(null);

  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showMessage = (msg: string, sev: "success" | "error" = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      const sorted = [...data].sort(
        (a: any, b: any) =>
          new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime(),
      );
      setBookings(sorted);
    } catch {
      showMessage("Failed to load reservations.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("/rooms");
        const rooms = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setAvailableRooms(rooms);
      } catch {
        /* silent */
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCheckIn, filterCheckOut, filterStatus]);

  const calculateTotal = (booking: any) => {
    if (booking.totalPrice && booking.totalPrice > 0) return booking.totalPrice;
    const room = booking.room;
    const pricePerNight = room?.basePrice || room?.roomType?.basePrice || 0;
    if (!booking.checkInDate || !booking.checkOutDate) return 0;
    const nights = Math.ceil(
      (new Date(booking.checkOutDate).getTime() -
        new Date(booking.checkInDate).getTime()) /
        86400000,
    );
    return Math.max(0, nights) * pricePerNight;
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(
      (b) => b.status?.toLowerCase() === "confirmed",
    ).length;
    const checkedIn = bookings.filter(
      (b) => b.status?.toLowerCase() === "checked-in",
    ).length;
    const cancelled = bookings.filter(
      (b) => b.status?.toLowerCase() === "cancelled",
    ).length;
    return { total, confirmed, checkedIn, cancelled };
  }, [bookings]);

  const hasActiveFilters = filterCheckIn || filterCheckOut || filterStatus;

  const handleClearFilters = () => {
    setFilterCheckIn("");
    setFilterCheckOut("");
    setFilterStatus("");
  };

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const guestName =
          `${booking.guest?.firstName ?? ""} ${booking.guest?.lastName ?? ""}`.toLowerCase();
        const roomNumber = booking.room?.roomNumber?.toString() ?? "";
        const email = booking.guest?.email ?? "";
        const matchesSearch =
          guestName.includes(searchTerm.toLowerCase()) ||
          roomNumber.includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm.toLowerCase());
        const bookingCheckIn = booking.checkInDate
          ? booking.checkInDate.split("T")[0]
          : "";
        const bookingCheckOut = booking.checkOutDate
          ? booking.checkOutDate.split("T")[0]
          : "";
        const matchesCheckIn = filterCheckIn
          ? bookingCheckIn === filterCheckIn
          : true;
        const matchesCheckOut = filterCheckOut
          ? bookingCheckOut === filterCheckOut
          : true;
        const matchesStatus = filterStatus
          ? booking.status?.toLowerCase() === filterStatus.toLowerCase()
          : true;
        return (
          matchesSearch && matchesCheckIn && matchesCheckOut && matchesStatus
        );
      }),
    [bookings, searchTerm, filterCheckIn, filterCheckOut, filterStatus],
  );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const statusOptions = [
    { label: "Confirmed", color: "#16a34a" },
    { label: "Checked-In", color: "#2563eb" },
    { label: "Checked-Out", color: "#64748b" },
    { label: "Cancelled", color: "#dc2626" },
  ];

  const handleOpenMoreInfo = (booking: any) => {
    setMoreInfoBooking(booking);
    setMoreInfoDialogOpen(true);
  };
  const handleCloseMoreInfo = () => {
    setMoreInfoDialogOpen(false);
    setMoreInfoBooking(null);
  };

  const handleOpenCancelDialog = (booking: any) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelLoading(true);
    try {
      await api.delete(`/bookings/${bookingToCancel._id}`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingToCancel._id ? { ...b, status: "Cancelled" } : b,
        ),
      );
      showMessage("Booking cancelled successfully.");
      handleCloseCancelDialog();
    } catch (err: any) {
      showMessage(
        err.response?.data?.message || "Error cancelling booking.",
        "error",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCreateInvoice = async (id: string) => {
    try {
      await api.post("/invoices", { bookingId: id });
      showMessage("Invoice created successfully.");
    } catch (err: any) {
      showMessage(
        err.response?.data?.message || "Error creating invoice.",
        "error",
      );
    }
  };

  const handleEditClick = (booking: any) => {
    setCurrentBooking(booking);
    setEditFormData({
      checkInDate: booking.checkInDate ? booking.checkInDate.split("T")[0] : "",
      checkOutDate: booking.checkOutDate
        ? booking.checkOutDate.split("T")[0]
        : "",
      status: booking.status || "Confirmed",
      room: booking.room?._id || "",
      totalPrice: calculateTotal(booking),
      notes: booking.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setCurrentBooking(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleEditSave = async () => {
    if (!currentBooking) return;
    setEditLoading(true);
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
      showMessage(
        err.response?.data?.message || "Error updating booking.",
        "error",
      );
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-end" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing={-0.5}
            sx={{
              fontSize: { xs: "1.75rem", md: "2.125rem" },
              textAlign: "left",
            }}
          >
            Reservations
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
            textAlign="left"
          >
            Manage hotel bookings and reservations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/booking")}
          sx={{
            borderRadius: "10px",
            px: 3,
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            width: { xs: "100%", sm: "auto" },
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          New Booking
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          icon={<CalendarMonthIcon fontSize="small" />}
          label="Total"
          value={stats.total}
          iconBg="#eff6ff"
          iconColor="#2563eb"
        />
        <StatCard
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          label="Confirmed"
          value={stats.confirmed}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          valueColor="#15803d"
        />
        <StatCard
          icon={<LoginIcon fontSize="small" />}
          label="Checked In"
          value={stats.checkedIn}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          valueColor="#1d4ed8"
        />
        <StatCard
          icon={<DoNotDisturbIcon fontSize="small" />}
          label="Cancelled"
          value={stats.cancelled}
          iconBg="#fef2f2"
          iconColor="#dc2626"
          valueColor="#b91c1c"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search by guest name, email or room number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: { borderRadius: "10px" },
          }}
        />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          width: "100%",
          boxSizing: "border-box",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <FilterListIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Filters
          </Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon fontSize="small" />}
              onClick={handleClearFilters}
              sx={{
                ml: "auto",
                textTransform: "none",
                fontSize: "0.75rem",
                color: "text.secondary",
              }}
            >
              Clear all
            </Button>
          )}
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Check-in Date"
            type="date"
            size="small"
            value={filterCheckIn}
            onChange={(e) => setFilterCheckIn(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            InputProps={{
              endAdornment: filterCheckIn ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setFilterCheckIn("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <TextField
            label="Check-out Date"
            type="date"
            size="small"
            value={filterCheckOut}
            onChange={(e) => setFilterCheckOut(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            InputProps={{
              endAdornment: filterCheckOut ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setFilterCheckOut("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <FormControl
            size="small"
            sx={{
              flex: 1,
              minWidth: 160,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              endAdornment={
                filterStatus ? (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => setFilterStatus("")}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              renderValue={(value) => {
                const match = statusOptions.find((o) => o.label === value);
                return (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: match?.color ?? "#64748b",
                        flexShrink: 0,
                      }}
                    />
                    {value as string}
                  </Box>
                );
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map(({ label, color }) => (
                <MenuItem key={label} value={label}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2">{label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {hasActiveFilters && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
            {filterCheckIn && (
              <Chip
                label={`Check-in: ${new Date(filterCheckIn).toLocaleDateString()}`}
                size="small"
                onDelete={() => setFilterCheckIn("")}
                color="primary"
                variant="outlined"
              />
            )}
            {filterCheckOut && (
              <Chip
                label={`Check-out: ${new Date(filterCheckOut).toLocaleDateString()}`}
                size="small"
                onDelete={() => setFilterCheckOut("")}
                color="primary"
                variant="outlined"
              />
            )}
            {filterStatus && (
              <Chip
                label={`Status: ${filterStatus}`}
                size="small"
                onDelete={() => setFilterStatus("")}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
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
          {paginatedBookings.length === 0 ? (
            <Paper
              sx={{ p: 6, textAlign: "center", borderRadius: "12px" }}
              elevation={0}
            >
              <CalendarMonthIcon
                sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
              />
              <Typography color="text.secondary">
                No reservations found.
              </Typography>
            </Paper>
          ) : (
            paginatedBookings.map((booking) => {
              const totalPrice = calculateTotal(booking);
              return (
                <Card
                  key={booking._id}
                  sx={{
                    mb: 2,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          bgcolor: "rgba(255,255,255,0.2)",
                          color: "#fff",
                          border: "1.5px solid rgba(255,255,255,0.4)",
                        }}
                      >
                        {`${booking.guest?.firstName?.[0] ?? ""}${booking.guest?.lastName?.[0] ?? ""}`.toUpperCase() ||
                          "?"}
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="#fff"
                      >
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </Typography>
                    </Box>
                    <StatusChip status={booking.status} />
                  </Box>
                  <CardContent sx={{ pt: 2, pb: "12px !important" }}>
                    <Stack spacing={1.2}>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <HotelIcon
                          sx={{ fontSize: 14, color: "text.disabled" }}
                        />
                        <Typography
                          variant="body2"
                          fontSize="0.82rem"
                          fontWeight={600}
                        >
                          Room {booking.room?.roomNumber || "N/A"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <EventIcon
                          sx={{ fontSize: 14, color: "text.disabled" }}
                        />
                        <DateRange
                          checkIn={booking.checkInDate}
                          checkOut={booking.checkOutDate}
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <AttachMoneyIcon
                          sx={{ fontSize: 14, color: "text.disabled" }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="success.main"
                        >
                          {hotel?.currency} {totalPrice.toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider />
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        flexWrap="wrap"
                      >
                        {[
                          {
                            icon: <InfoOutlinedIcon sx={{ fontSize: 15 }} />,
                            color: "#2563eb",
                            hoverBg: "#eff6ff",
                            hoverBorder: "#bfdbfe",
                            label: "More info",
                            onClick: () => handleOpenMoreInfo(booking),
                          },
                          {
                            icon: <ReceiptIcon sx={{ fontSize: 15 }} />,
                            color: "#16a34a",
                            hoverBg: "#f0fdf4",
                            hoverBorder: "#bbf7d0",
                            label: "Invoice",
                            onClick: () => handleCreateInvoice(booking._id),
                          },
                          {
                            icon: <EditIcon sx={{ fontSize: 15 }} />,
                            color: "#2563eb",
                            hoverBg: "#eff6ff",
                            hoverBorder: "#bfdbfe",
                            label: "Edit",
                            onClick: () => handleEditClick(booking),
                          },
                          {
                            icon: <CancelIcon sx={{ fontSize: 15 }} />,
                            color: "#dc2626",
                            hoverBg: "#fef2f2",
                            hoverBorder: "#fecaca",
                            label: "Cancel",
                            onClick: () => handleOpenCancelDialog(booking),
                          },
                        ].map(
                          ({
                            icon,
                            color,
                            hoverBg,
                            hoverBorder,
                            label,
                            onClick,
                          }) => (
                            <Tooltip title={label} key={label} arrow>
                              <IconButton
                                size="small"
                                onClick={onClick}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1.5,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  color,
                                  bgcolor: "transparent",
                                  "&:hover": {
                                    bgcolor: hoverBg,
                                    borderColor: hoverBorder,
                                  },
                                  transition: "all 0.15s",
                                }}
                              >
                                {icon}
                              </IconButton>
                            </Tooltip>
                          ),
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => {
                  setCurrentPage(value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                color="primary"
                shape="rounded"
                size="small"
              />
            </Box>
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "#f8fafc",
                  "& th": {
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  },
                }}
              >
                {[
                  "Guest",
                  "Room",
                  "Check In / Out",
                  "Total Price",
                  "Status",
                  "Actions",
                ].map((label, i) => (
                  <TableCell
                    key={label}
                    align={
                      i === 3
                        ? "right"
                        : i === 4
                          ? "center"
                          : i === 5
                            ? "right"
                            : "left"
                    }
                    sx={{
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      ...(i === 0 && { pl: 2.5 }),
                      ...(i === 5 && { pr: 2.5 }),
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1}
                    >
                      <CalendarMonthIcon
                        sx={{ fontSize: 40, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        No reservations found
                      </Typography>
                      {(hasActiveFilters || searchTerm) && (
                        <Button
                          size="small"
                          onClick={() => {
                            handleClearFilters();
                            setSearchTerm("");
                          }}
                          sx={{ mt: 0.5, textTransform: "none" }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking, rowIdx) => {
                  const totalPrice = calculateTotal(booking);
                  const isEven = rowIdx % 2 === 0;
                  return (
                    <TableRow
                      key={booking._id}
                      sx={{
                        bgcolor: isEven
                          ? "transparent"
                          : theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.015)"
                            : "rgba(0,0,0,0.012)",
                        "&:last-child td": { border: 0 },
                        "&:hover": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(59,130,246,0.04)",
                        },
                        transition: "background 0.12s",
                        "& td": {
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell sx={{ pl: 2.5, py: 1.75 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <GuestAvatar
                            firstName={booking.guest?.firstName}
                            lastName={booking.guest?.lastName}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              fontSize="0.85rem"
                              lineHeight={1.3}
                            >
                              {booking.guest?.firstName}{" "}
                              {booking.guest?.lastName}
                            </Typography>
                            {booking.guest?.email && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontSize="0.72rem"
                              >
                                {booking.guest.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <HotelIcon
                            sx={{ fontSize: 14, color: "text.disabled" }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            fontSize="0.82rem"
                          >
                            Room {booking.room?.roomNumber || "N/A"}
                          </Typography>
                        </Box>
                        {booking.room?.roomType?.name && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.72rem"
                            sx={{ pl: 2.75 }}
                          >
                            {booking.room.roomType.name}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <DateRange
                          checkIn={booking.checkInDate}
                          checkOut={booking.checkOutDate}
                        />
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1.75 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          fontSize="0.9rem"
                        >
                          {hotel?.currency} {totalPrice.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 1.75 }}>
                        <StatusChip status={booking.status} />
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1.75, pr: 2.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={0.75}
                        >
                          {[
                            {
                              icon: <InfoOutlinedIcon sx={{ fontSize: 15 }} />,
                              color: "#2563eb",
                              hoverBg: "#eff6ff",
                              hoverBorder: "#bfdbfe",
                              title: "More info",
                              onClick: () => handleOpenMoreInfo(booking),
                            },
                            {
                              icon: <ReceiptIcon sx={{ fontSize: 15 }} />,
                              color: "#16a34a",
                              hoverBg: "#f0fdf4",
                              hoverBorder: "#bbf7d0",
                              title: "Create invoice",
                              onClick: () => handleCreateInvoice(booking._id),
                            },
                            {
                              icon: <EditIcon sx={{ fontSize: 15 }} />,
                              color: "#2563eb",
                              hoverBg: "#eff6ff",
                              hoverBorder: "#bfdbfe",
                              title: "Edit booking",
                              onClick: () => handleEditClick(booking),
                            },
                          ].map(
                            ({
                              icon,
                              color,
                              hoverBg,
                              hoverBorder,
                              title,
                              onClick,
                            }) => (
                              <Tooltip title={title} key={title} arrow>
                                <IconButton
                                  size="small"
                                  onClick={onClick}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    color,
                                    bgcolor: "transparent",
                                    "&:hover": {
                                      bgcolor: hoverBg,
                                      borderColor: hoverBorder,
                                    },
                                    transition: "all 0.15s",
                                  }}
                                >
                                  {icon}
                                </IconButton>
                              </Tooltip>
                            ),
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table footer */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 1.5,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "#fafafa",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Showing{" "}
                <strong>
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredBookings.length,
                  )}
                </strong>{" "}
                of <strong>{filteredBookings.length}</strong> reservations
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                color="primary"
                shape="rounded"
                size="small"
                onChange={(_, value) => {
                  setCurrentPage(value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </Box>
          )}
        </TableContainer>
      )}

      {/* ── More Info Dialog ── */}
      <Dialog
        open={moreInfoDialogOpen}
        onClose={handleCloseMoreInfo}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                bgcolor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </Box>
            <Typography fontWeight={800} fontSize="1.05rem">
              Booking Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {moreInfoBooking && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack spacing={1.5}>
                {[
                  { label: "Adults", value: moreInfoBooking.adults ?? "—" },
                  { label: "Children", value: moreInfoBooking.children ?? "—" },
                ].map(({ label, value }) => (
                  <React.Fragment key={label}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {value}
                      </Typography>
                    </Box>
                    <Divider />
                  </React.Fragment>
                ))}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    Notes
                  </Typography>
                  <Typography
                    variant="body2"
                    mt={0.5}
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {moreInfoBooking.notes || "No notes provided."}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={handleCloseMoreInfo}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700, boxShadow: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cancel Dialog ── */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                bgcolor: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon fontSize="small" />
            </Box>
            <Typography fontWeight={800} fontSize="1.05rem">
              Cancel Reservation
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are about to cancel the reservation for:
          </Typography>
          {bookingToCancel && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack spacing={1}>
                {[
                  {
                    label: "Guest",
                    value: `${bookingToCancel.guest?.firstName} ${bookingToCancel.guest?.lastName}`,
                  },
                  {
                    label: "Room",
                    value: bookingToCancel.room?.roomNumber || "N/A",
                  },
                  {
                    label: "Check-in",
                    value: new Date(
                      bookingToCancel.checkInDate,
                    ).toLocaleDateString(),
                  },
                  {
                    label: "Check-out",
                    value: new Date(
                      bookingToCancel.checkOutDate,
                    ).toLocaleDateString(),
                  },
                ].map(({ label, value }, i, arr) => (
                  <React.Fragment key={label}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={i === 0 ? 700 : 500}
                      >
                        {value}
                      </Typography>
                    </Box>
                    {i < arr.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Stack>
            </Paper>
          )}
          <Typography
            variant="body2"
            color="error.main"
            fontWeight={600}
            mt={2}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
          <Button
            onClick={handleCloseCancelDialog}
            color="inherit"
            disabled={cancelLoading}
            sx={{ fontWeight: 600 }}
          >
            Keep Reservation
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={cancelLoading}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 120,
              boxShadow: "none",
            }}
          >
            {cancelLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800} sx={{ pb: 1 }}>
          Edit Reservation
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sx={{ width: "100%"}}>
              <TextField
                select
                label="Room"
                fullWidth
                name="room"
                value={editFormData.room}
                onChange={handleEditChange}
              >
                {availableRooms.map((room) => (
                  <MenuItem key={room._id} value={room._id}>
                    Room {room.roomNumber} — {room.roomType?.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: "100%" }}>
              <TextField
                label="Check-in Date"
                type="date"
                fullWidth
                name="checkInDate"
                value={editFormData.checkInDate}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: "100%" }}>
              <TextField
                label="Check-out Date"
                type="date"
                fullWidth
                name="checkOutDate"
                value={editFormData.checkOutDate}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}  sx={{ width: "100%" }}>
              <TextField
                select
                label="Status"
                fullWidth
                name="status"
                value={editFormData.status}
                onChange={handleEditChange}
              >
                {statusOptions.map(({ label, color }) => (
                  <MenuItem key={label} value={label}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          bgcolor: color,
                          flexShrink: 0,
                        }}
                      />
                      {label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}  sx={{ width: "100%" }}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                name="notes"
                value={editFormData.notes}
                onChange={handleEditChange}
                placeholder="Add any special requests or notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
          <Button
            onClick={handleEditClose}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={editLoading}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 130,
              boxShadow: "none",
            }}
          >
            {editLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default AllReservationsPage;
