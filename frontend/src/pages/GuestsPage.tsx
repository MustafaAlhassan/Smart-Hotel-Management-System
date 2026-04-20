import { useEffect, useState, useCallback } from "react";
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
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Home as HomeIcon,
  BookOnline as BookingIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import api from "../services/api";

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
  firstName: string;
  lastName: string;
}) => {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const colors = getAvatarColors(`${firstName}${lastName}`);
  return (
    <Avatar
      sx={{
        width: 36,
        height: 36,
        fontSize: "0.75rem",
        fontWeight: 700,
        bgcolor: colors.bg,
        color: colors.color,
        border: `1.5px solid ${colors.border}`,
        flexShrink: 0,
      }}
    >
      {initials}
    </Avatar>
  );
};

const BookingBadge = ({ count }: { count: number }) => {
  const hasBookings = count > 0;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        py: 0.35,
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 700,
        bgcolor: hasBookings ? "#eff6ff" : "transparent",
        color: hasBookings ? "#1d4ed8" : "text.disabled",
        border: `1px solid ${hasBookings ? "#bfdbfe" : "currentColor"}`,
        whiteSpace: "nowrap",
      }}
    >
      <BookingIcon sx={{ fontSize: 12 }} />
      {count} {count === 1 ? "booking" : "bookings"}
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

const IdBadge = ({ id }: { id: string }) => {
  const theme = useTheme();
  return (
    <Box
      component="span"
      sx={{
        fontFamily: "monospace",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor:
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "#f8fafc",
        color: "text.secondary",
        border: "1px solid",
        borderColor: "divider",
        display: "inline-block",
        maxWidth: 140,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
      }}
    >
      {id}
    </Box>
  );
};

const GuestsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGuests, setTotalGuests] = useState(0);

  const [globalStats, setGlobalStats] = useState({
    total: 0,
    withBookings: 0,
    totalBookings: 0,
  });

  const fetchGlobalStats = useCallback(async () => {
    try {
      const response = await api.get("/guests", {
        params: { page: 1, limit: 9999 },
      });
      const all: any[] = response.data?.data || [];
      setGlobalStats({
        total: response.data?.pagination?.total ?? all.length,
        withBookings: all.filter((g) => (g.bookingCount ?? 0) > 0).length,
        totalBookings: all.reduce((sum, g) => sum + (g.bookingCount ?? 0), 0),
      });
    } catch {
      // silently ignore — stats are supplementary
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const showMessage = (msg: string, sev: "success" | "error" = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/guests", {
        params: { page, limit: 10, search: searchTerm },
      });
      if (response.data) {
        setGuests(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalGuests(
          response.data.pagination?.total || response.data.data?.length || 0,
        );
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
    setSaveLoading(true);
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
      fetchGlobalStats();
    } catch (err: any) {
      showMessage(err.response?.data?.message || "Error saving guest", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/guests/${id}`);
      showMessage("Guest deleted successfully");
      setDeleteConfirmId(null);
      fetchGuests();
      fetchGlobalStats();
    } catch (err: any) {
      showMessage("Error deleting guest", "error");
    } finally {
      setDeleteLoading(false);
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
            Guests
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
            textAlign="left"
          >
            View and manage your hotel guest database
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => handleOpenDialog()}
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
          Add New Guest
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          icon={<PeopleIcon fontSize="small" />}
          label="Total Guests"
          value={globalStats.total}
          iconBg="#eff6ff"
          iconColor="#2563eb"
        />
        <StatCard
          icon={<BookingIcon fontSize="small" />}
          label="With Bookings"
          value={globalStats.withBookings}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          valueColor="#15803d"
        />
        <StatCard
          icon={<AddIcon fontSize="small" />}
          label="Total Bookings"
          value={globalStats.totalBookings}
          iconBg="#faf5ff"
          iconColor="#7c3aed"
          valueColor="#6d28d9"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
          boxSizing: "border-box",
        }}
      >
        <TextField
          fullWidth
          size="small"
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
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: { borderRadius: "10px" },
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
          <CircularProgress size={50} />
        </Box>
      ) : isMobile ? (
        <Box>
          {guests.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              py={6}
            >
              No guests found.
            </Typography>
          ) : (
            guests.map((guest) => (
              <Card
                key={guest._id}
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
                      {`${guest.firstName?.[0] ?? ""}${guest.lastName?.[0] ?? ""}`.toUpperCase()}
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color="#fff"
                    >
                      {guest.firstName} {guest.lastName}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(guest)}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1.5,
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirmId(guest._id)}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1.5,
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        "&:hover": { bgcolor: "rgba(239,68,68,0.4)" },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                </Box>
                <CardContent sx={{ pt: 2, pb: "12px !important" }}>
                  <Stack spacing={1.2}>
                    <Box display="flex" alignItems="center" gap={1.25}>
                      <BadgeIcon
                        sx={{ fontSize: 14, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.8rem"
                      >
                        {guest.idNumber}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.25}>
                      <EmailIcon
                        sx={{ fontSize: 14, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.8rem"
                        noWrap
                      >
                        {guest.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.25}>
                      <PhoneIcon
                        sx={{ fontSize: 14, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.8rem"
                      >
                        {guest.phoneNumber}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.25}>
                      <HomeIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.8rem"
                        noWrap
                      >
                        {guest.address || "No address provided"}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="flex-end">
                      <BookingBadge count={guest.bookingCount ?? 0} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
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
                  "ID Number",
                  "Contact Info",
                  "Address",
                  "Bookings",
                  "Actions",
                ].map((label, i) => (
                  <TableCell
                    key={label}
                    align={i === 5 ? "right" : "left"}
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
              {guests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1}
                    >
                      <PeopleIcon
                        sx={{ fontSize: 40, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        No guests found
                      </Typography>
                      {searchTerm && (
                        <Button
                          size="small"
                          onClick={() => setSearchTerm("")}
                          sx={{ mt: 0.5, textTransform: "none" }}
                        >
                          Clear search
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                guests.map((guest, rowIdx) => {
                  const isEven = rowIdx % 2 === 0;
                  return (
                    <TableRow
                      key={guest._id}
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
                            firstName={guest.firstName}
                            lastName={guest.lastName}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              fontSize="0.85rem"
                              lineHeight={1.3}
                            >
                              {guest.firstName} {guest.lastName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <IdBadge id={guest.idNumber} />
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.75}
                          mb={0.4}
                        >
                          <EmailIcon
                            sx={{ fontSize: 13, color: "text.disabled" }}
                          />
                          <Typography
                            variant="body2"
                            fontSize="0.82rem"
                            color="text.primary"
                          >
                            {guest.email}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <PhoneIcon
                            sx={{ fontSize: 13, color: "text.disabled" }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.75rem"
                          >
                            {guest.phoneNumber}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.75, maxWidth: 200 }}>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <HomeIcon
                            sx={{
                              fontSize: 13,
                              color: "text.disabled",
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontSize="0.82rem"
                            color="text.secondary"
                            noWrap
                          >
                            {guest.address || "—"}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <BookingBadge count={guest.bookingCount ?? 0} />
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1.75, pr: 2.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={0.75}
                        >
                          <Tooltip title="Edit guest" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(guest)}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                                color: "#2563eb",
                                bgcolor: "transparent",
                                "&:hover": {
                                  bgcolor: "#eff6ff",
                                  borderColor: "#bfdbfe",
                                },
                                transition: "all 0.15s",
                              }}
                            >
                              <EditIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete guest" arrow>
                            <IconButton
                              size="small"
                              onClick={() => setDeleteConfirmId(guest._id)}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                                color: "#dc2626",
                                bgcolor: "transparent",
                                "&:hover": {
                                  bgcolor: "#fef2f2",
                                  borderColor: "#fecaca",
                                },
                                transition: "all 0.15s",
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

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
                  {(page - 1) * 10 + 1}–{Math.min(page * 10, totalGuests)}
                </strong>{" "}
                of <strong>{totalGuests}</strong> guests
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => {
                  setPage(v);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                color="primary"
                shape="rounded"
                size="small"
              />
            </Box>
          )}
        </TableContainer>
      )}

      {isMobile && totalPages > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => {
              setPage(v);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800} sx={{ pb: 1 }}>
          {selectedGuest ? "Edit Guest Profile" : "Register New Guest"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID / Passport Number"
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1.5 }}
                    >
                      <HomeIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveGuest}
            variant="contained"
            disabled={saveLoading}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 120,
              boxShadow: "none",
            }}
          >
            {saveLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : selectedGuest ? (
              "Save Changes"
            ) : (
              "Add Guest"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800} sx={{ pb: 1 }}>
          Delete Guest
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Are you sure you want to delete this guest? This action cannot be
            undone and will remove all associated records.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setDeleteConfirmId(null)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              deleteConfirmId && handleDeleteGuest(deleteConfirmId)
            }
            variant="contained"
            color="error"
            disabled={deleteLoading}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 90,
              boxShadow: "none",
            }}
          >
            {deleteLoading ? (
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GuestsPage;
