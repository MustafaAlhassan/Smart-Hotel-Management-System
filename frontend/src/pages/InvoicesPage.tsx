import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Skeleton,
  Card,
  CardContent,
  Pagination,
  Avatar,
} from "@mui/material";
import {
  Print as PrintIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  CalendarToday as CalendarTodayIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import api from "../services/api";
import { useHotel } from "../context/HotelContext";

export interface IGuest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  idNumber?: string;
  address?: string;
}

export interface IService {
  _id: string;
  name: string;
  price: number;
  isTaxable: boolean;
}

export interface IInvoiceServiceItem {
  service: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  _id?: string;
}

export interface ICreatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

export interface IInvoice {
  _id: string;
  booking: any;
  createdBy?: ICreatedBy;
  usedServices: IInvoiceServiceItem[];
  totalRoomCharge: number;
  totalServiceCharge: number;
  taxAmount: number;
  totalAmountDue: number;
  paymentStatus: "Paid" | "Pending";
  paymentMethod?: "Cash" | "Credit Card" | "Online" | "Bank Transfer";
  issueDate: string;
}

const guestCache: Record<string, IGuest> = {};
const bookingCache: Record<string, any> = {};

const PRINT_STYLES = `
  @media print {
    @page { margin: 0; size: A4; }
    body * { visibility: hidden !important; }
    #invoice-print-area,
    #invoice-print-area * { visibility: visible !important; }
    #invoice-print-area {
      position: fixed !important;
      inset: 0 !important;
      padding: 48px !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #invoice-print-area p,
    #invoice-print-area span,
    #invoice-print-area td,
    #invoice-print-area th,
    #invoice-print-area div,
    #invoice-print-area h1,
    #invoice-print-area h2,
    #invoice-print-area h3,
    #invoice-print-area h4,
    #invoice-print-area h5,
    #invoice-print-area h6 {
      color: #0f172a !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #invoice-print-area .p-secondary { color: #475569 !important; }
    #invoice-print-area .p-thead th {
      background-color: #f1f5f9 !important;
      color: #334155 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #invoice-print-area .p-total-row td {
      background-color: #1e293b !important;
      color: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #invoice-print-area .p-status-paid    { color: #16a34a !important; }
    #invoice-print-area .p-status-partial { color: #0284c7 !important; }
    #invoice-print-area .p-status-pending { color: #d97706 !important; }
    .no-print { display: none !important; }
  }
`;

const PAGE_SIZE = 10;

const getRoleColor = (role: string): string => {
  const r = role?.toLowerCase();
  if (r === "admin") return "#4caf50";
  if (r === "manager") return "#2196f3";
  if (r === "receptionist") return "#9c27b0";
  if (r === "housekeeping") return "#ff9800";
  return "#757575";
};

const CreatedByBadge = ({ user }: { user?: ICreatedBy }) => {
  if (!user) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Avatar
        sx={{
          width: 26,
          height: 26,
          fontSize: "0.65rem",
          fontWeight: 700,
          bgcolor: getRoleColor(user.role),
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="caption" color="text.secondary" lineHeight={1}>
          {user.role}
        </Typography>
      </Box>
    </Box>
  );
};

const InvoicesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { hotel } = useHotel();

  const currency = hotel?.currency ?? "$";

  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [availableServices, setAvailableServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [invoiceGuests, setInvoiceGuests] = useState<
    Record<string, IGuest | null>
  >({});
  const [guestsLoading, setGuestsLoading] = useState<Record<string, boolean>>(
    {},
  );

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openAddServiceDialog, setOpenAddServiceDialog] = useState(false);

  const [currentInvoice, setCurrentInvoice] = useState<IInvoice | null>(null);
  const [currentGuest, setCurrentGuest] = useState<IGuest | null>(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [addServiceLoading, setAddServiceLoading] = useState(false);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);

  const [paymentData, setPaymentData] = useState({
    paymentStatus: "Pending",
    paymentMethod: "",
  });
  const [serviceData, setServiceData] = useState({
    serviceId: "",
    quantity: 1,
  });
  const [selectedService, setSelectedService] = useState<IService | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const resolveGuest = useCallback(
    async (booking: any): Promise<IGuest | null> => {
      if (!booking) return null;
      if (typeof booking === "string") {
        if (!bookingCache[booking]) {
          try {
            const res = await api.get(`/bookings/${booking}`);
            bookingCache[booking] = res.data.data || res.data;
          } catch {
            return null;
          }
        }
        booking = bookingCache[booking];
      }
      if (!booking?.guest) return null;
      if (typeof booking.guest === "object" && booking.guest.firstName) {
        const guest = booking.guest as IGuest;
        guestCache[guest._id] = guest;
        return guest;
      }
      const guestId =
        typeof booking.guest === "string" ? booking.guest : booking.guest._id;
      if (!guestId) return null;
      if (guestCache[guestId]) return guestCache[guestId];
      try {
        const res = await api.get(`/guests/${guestId}`);
        const guest: IGuest = res.data.data || res.data;
        guestCache[guestId] = guest;
        return guest;
      } catch {
        return null;
      }
    },
    [],
  );

  const resolveGuestsForInvoices = useCallback(
    async (invoiceList: IInvoice[]) => {
      const loadingMap: Record<string, boolean> = {};
      invoiceList.forEach((inv) => (loadingMap[inv._id] = true));
      setGuestsLoading(loadingMap);
      const results = await Promise.allSettled(
        invoiceList.map((inv) => resolveGuest(inv.booking)),
      );
      const guestMap: Record<string, IGuest | null> = {};
      const doneMap: Record<string, boolean> = {};
      results.forEach((result, idx) => {
        const id = invoiceList[idx]._id;
        guestMap[id] = result.status === "fulfilled" ? result.value : null;
        doneMap[id] = false;
      });
      setInvoiceGuests(guestMap);
      setGuestsLoading(doneMap);
    },
    [resolveGuest],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invoicesResult, servicesResult] = await Promise.allSettled([
        api.get("/invoices"),
        api.get("/services"),
      ]);
      if (invoicesResult.status === "rejected") {
        const err = invoicesResult.reason;
        showSnackbar(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch invoices",
          "error",
        );
        return;
      }
      const fetchedInvoices: IInvoice[] = invoicesResult.value.data;
      setInvoices(fetchedInvoices);
      if (servicesResult.status === "fulfilled") {
        const sData = servicesResult.value.data;
        setAvailableServices(sData.data || sData);
      }
      resolveGuestsForInvoices(fetchedInvoices);
    } catch (error: any) {
      showSnackbar(error?.message || "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  }, [resolveGuestsForInvoices]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(invoices.length / PAGE_SIZE);
  const paginated = invoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusChipColor = (status: string) => {
    if (status === "Paid") return "success";
    return "warning";
  };

  const getStatusPrintClass = (status: string) => {
    if (status === "Paid") return "p-status-paid";
    return "p-status-pending";
  };

  const getStatusHexColor = (status: string) => {
    if (status === "Paid") return "#16a34a";
    return "#d97706";
  };

  const handleOpenPayment = (invoice: IInvoice) => {
    setCurrentInvoice(invoice);
    setPaymentData({
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod || "Cash",
    });
    setOpenPaymentDialog(true);
  };

  const handleOpenPrint = async (invoice: IInvoice) => {
    setCurrentInvoice(invoice);
    setCurrentGuest(null);
    setPrintLoading(true);
    setOpenPrintDialog(true);
    try {
      const cachedGuest = invoiceGuests[invoice._id];
      if (cachedGuest) {
        setCurrentGuest(cachedGuest);
      } else {
        const guest = await resolveGuest(invoice.booking);
        setCurrentGuest(guest);
      }
    } catch (error) {
      console.error("Failed to fetch invoice details", error);
    } finally {
      setPrintLoading(false);
    }
  };

  const handleOpenAddService = (invoice: IInvoice) => {
    setCurrentInvoice(invoice);
    setServiceData({ serviceId: "", quantity: 1 });
    setSelectedService(null);
    setOpenAddServiceDialog(true);
  };

  const handleUpdatePayment = async () => {
    if (!currentInvoice) return;
    setUpdatePaymentLoading(true);
    try {
      await api.patch(`/invoices/${currentInvoice._id}/payment`, paymentData);
      showSnackbar("Payment updated successfully", "success");
      setOpenPaymentDialog(false);
      fetchData();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to update payment",
        "error",
      );
    } finally {
      setUpdatePaymentLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!currentInvoice || !serviceData.serviceId) return;
    setAddServiceLoading(true);
    try {
      const response = await api.patch(
        `/invoices/${currentInvoice._id}/services`,
        {
          serviceId: serviceData.serviceId,
          quantity: serviceData.quantity,
        },
      );
      // Sync currentInvoice with the updated data returned from the server
      const updated: IInvoice = response.data.data || response.data;
      setCurrentInvoice(updated);
      setInvoices((prev) =>
        prev.map((inv) => (inv._id === updated._id ? updated : inv)),
      );
      showSnackbar("Service added successfully", "success");
      setOpenAddServiceDialog(false);
      setSelectedService(null);
      fetchData();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to add service",
        "error",
      );
    } finally {
      setAddServiceLoading(false);
    }
  };

  const handlePrint = () => window.print();

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
    <Box
      sx={{
        width: "100%",
        p: { xs: 2, md: 4 },
        boxSizing: "border-box",
        "@media print": { display: openPrintDialog ? "block" : "none", p: 0 },
      }}
    >
      <style>{PRINT_STYLES}</style>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-end" },
          gap: 2,
          mb: 4,
          "@media print": { display: "none" },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing={-0.5}
            sx={{
              fontSize: { xs: "1.75rem", md: "2.125rem", textAlign: "left" },
            }}
          >
            Invoices
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
            textAlign={"left"}
          >
            Manage guest billing and payments
          </Typography>
        </Box>
      </Box>

      {isMobile ? (
        <Box sx={{ "@media print": { display: "none" } }}>
          {invoices.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              py={5}
            >
              No invoices found.
            </Typography>
          ) : (
            <>
              {paginated.map((invoice) => {
                const guest = invoiceGuests[invoice._id];
                const isGuestLoading = guestsLoading[invoice._id];
                return (
                  <Card
                    key={invoice._id}
                    sx={{
                      mb: 2,
                      borderRadius: "16px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                      overflow: "hidden",
                      border: `1px solid ${theme.palette.divider}`,
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
                      {isGuestLoading ? (
                        <Skeleton
                          variant="text"
                          width={140}
                          height={24}
                          sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                      ) : (
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color="#fff"
                        >
                          {guest
                            ? `${guest.firstName} ${guest.lastName}`
                            : "Unknown Guest"}
                        </Typography>
                      )}
                      <Chip
                        label={invoice.paymentStatus}
                        size="small"
                        color={getStatusChipColor(invoice.paymentStatus)}
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      />
                    </Box>

                    <CardContent sx={{ pt: 2, pb: "12px !important" }}>
                      <Stack spacing={1.2}>
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
                            INVOICE ID
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            letterSpacing={0.5}
                          >
                            {invoice._id.slice(-8).toUpperCase()}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <CalendarTodayIcon
                              sx={{ fontSize: 14, opacity: 0.55 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              DATE
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <BadgeIcon sx={{ fontSize: 14, opacity: 0.55 }} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              CREATED BY
                            </Typography>
                          </Box>
                          <CreatedByBadge user={invoice.createdBy} />
                        </Box>
                        <Divider />
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
                            TOTAL
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={900}
                            color="success.main"
                            lineHeight={1}
                          >
                            {currency}
                            {invoice.totalAmountDue.toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        mt={1.5}
                      >
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleOpenAddService(invoice)}
                          sx={{ bgcolor: "action.hover", borderRadius: "8px" }}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenPayment(invoice)}
                          sx={{ bgcolor: "action.hover", borderRadius: "8px" }}
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleOpenPrint(invoice)}
                          sx={{ bgcolor: "action.hover", borderRadius: "8px" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => {
                      setPage(value);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    color="primary"
                    shape="rounded"
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflowX: "auto",
              "@media print": { display: "none" },
            }}
          >
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                  {[
                    "Invoice ID",
                    "Guest Name",
                    "Issue Date",
                    "Created By",
                    "Total Amount",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      align={
                        h === "Actions" || h === "Total Amount"
                          ? "right"
                          : "left"
                      }
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
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="text.secondary">
                        No invoices found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((invoice) => {
                    const guest = invoiceGuests[invoice._id];
                    const isGuestLoading = guestsLoading[invoice._id];
                    return (
                      <TableRow
                        key={invoice._id}
                        sx={{
                          "&:last-child td": { border: 0 },
                          "&:hover": { bgcolor: theme.palette.action.hover },
                          transition: "background 0.15s",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {invoice._id.slice(-8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {isGuestLoading ? (
                            <Skeleton variant="text" width={120} height={20} />
                          ) : guest ? (
                            <Typography variant="body2" fontWeight={600}>
                              {guest.firstName} {guest.lastName}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              Unknown Guest
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <CreatedByBadge user={invoice.createdBy} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="success.main"
                          >
                            {currency}
                            {invoice.totalAmountDue.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.paymentStatus}
                            size="small"
                            color={getStatusChipColor(invoice.paymentStatus)}
                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            justifyContent="flex-end"
                            spacing={1}
                          >
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenAddService(invoice)}
                            >
                              <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenPayment(invoice)}
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleOpenPrint(invoice)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => {
                  setPage(value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Update Payment</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField
              select
              label="Payment Status"
              fullWidth
              value={paymentData.paymentStatus}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  paymentStatus: e.target.value,
                })
              }
            >
              {["Paid", "Pending"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Payment Method"
              fullWidth
              value={paymentData.paymentMethod}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  paymentMethod: e.target.value,
                })
              }
            >
              {["Cash", "Credit Card", "Online", "Bank Transfer"].map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenPaymentDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePayment}
            variant="contained"
            disabled={updatePaymentLoading}
            sx={{ borderRadius: 2, fontWeight: 700, minWidth: 90 }}
          >
            {updatePaymentLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddServiceDialog}
        onClose={() => { setOpenAddServiceDialog(false); setSelectedService(null); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Add Service</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField
              select
              label="Select Service"
              fullWidth
              value={serviceData.serviceId}
              onChange={(e) => {
                const svc = availableServices.find(
                  (s) => s._id === e.target.value,
                );
                setServiceData({ ...serviceData, serviceId: e.target.value });
                setSelectedService(svc || null);
              }}
            >
              {availableServices.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                    alignItems="center"
                    gap={1}
                  >
                    <span>{s.name}</span>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Typography variant="body2" fontWeight={700}>
                        {currency}
                        {s.price.toFixed(2)}
                      </Typography>
                      {s.isTaxable && (
                        <Chip
                          label="Tax"
                          size="small"
                          color="warning"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            borderRadius: 1,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={serviceData.quantity}
              onChange={(e) =>
                setServiceData({
                  ...serviceData,
                  quantity: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
            />

            {selectedService && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textTransform="uppercase"
                  display="block"
                  mb={1}
                >
                  Cost Preview
                </Typography>
                <Stack spacing={0.75}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Unit price
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {currency}
                      {selectedService.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      × {serviceData.quantity}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {currency}
                      {(selectedService.price * serviceData.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Taxable
                    </Typography>
                    <Chip
                      label={selectedService.isTaxable ? "Yes" : "No"}
                      size="small"
                      color={selectedService.isTaxable ? "warning" : "default"}
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
                    />
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => { setOpenAddServiceDialog(false); setSelectedService(null); }}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddService}
            variant="contained"
            disabled={!serviceData.serviceId || addServiceLoading}
            sx={{ borderRadius: 2, fontWeight: 700, minWidth: 80 }}
          >
            {addServiceLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            "@media print": {
              boxShadow: "none",
              margin: 0,
              width: "100%",
              maxWidth: "100% !important",
              borderRadius: 0,
            },
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 2, sm: 3, md: 6 } }}>
          {currentInvoice && (
            <Box id="invoice-print-area">
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "flex-start" }}
                gap={2}
                mb={{ xs: 3, md: 6 }}
              >
                <Box>
                  <Typography
                    fontWeight={900}
                    letterSpacing={-1}
                    sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}
                  >
                    INVOICE
                  </Typography>
                  <Typography
                    variant="body2"
                    className="p-secondary"
                    color="text.secondary"
                    mt={0.5}
                    sx={{ wordBreak: "break-all" }}
                  >
                    ID: {currentInvoice._id.slice(-12).toUpperCase()}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="p-secondary"
                    color="text.secondary"
                  >
                    Date:{" "}
                    {new Date(currentInvoice.issueDate).toLocaleDateString()}
                  </Typography>
                  {currentInvoice.createdBy && (
                    <Typography
                      variant="body2"
                      className="p-secondary"
                      color="text.secondary"
                    >
                      Issued by: {currentInvoice.createdBy.firstName}{" "}
                      {currentInvoice.createdBy.lastName} (
                      {currentInvoice.createdBy.role})
                    </Typography>
                  )}
                </Box>
                <Box textAlign={{ xs: "left", sm: "right" }}>
                  <Typography variant="h6" fontWeight={800}>
                    {hotel?.name ?? "AMI Hotel"}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="p-secondary"
                    color="text.secondary"
                  >
                    E-mail: {hotel?.email ?? "ami@hotel.com"}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="p-secondary"
                    color="text.secondary"
                  >
                    Phone: {hotel?.phone ?? ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="p-secondary"
                    color="text.secondary"
                  >
                    {hotel?.address ?? ""}
                  </Typography>
                </Box>
              </Box>

              <Box mb={4}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  className="p-secondary"
                  color="text.secondary"
                  textTransform="uppercase"
                >
                  Bill To
                </Typography>
                {printLoading ? (
                  <Box mt={1}>
                    <Skeleton variant="text" width={180} height={28} />
                    <Skeleton variant="text" width={220} height={20} />
                    <Skeleton variant="text" width={160} height={20} />
                    <Skeleton variant="text" width={140} height={20} />
                  </Box>
                ) : currentGuest ? (
                  <Box mt={1}>
                    <Typography variant="h6" fontWeight={800}>
                      {currentGuest.firstName} {currentGuest.lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="p-secondary"
                      color="text.secondary"
                    >
                      Email: {currentGuest.email}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="p-secondary"
                      color="text.secondary"
                    >
                      Phone: {currentGuest.phoneNumber || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="p-secondary"
                      color="text.secondary"
                    >
                      Passport Number: {currentGuest.idNumber || "N/A"}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" fontWeight={600} mt={0.5}>
                    Guest details unavailable
                  </Typography>
                )}
              </Box>

              <TableContainer sx={{ mb: 4, overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 380 }}>
                  <TableHead>
                    <TableRow
                      className="p-thead"
                      sx={{
                        borderBottom: `2px solid ${theme.palette.divider}`,
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, pb: 2, px: 0 }}>
                        Description
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, pb: 2, px: 0 }}
                      >
                        Qty
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, pb: 2, px: 0 }}
                      >
                        Unit Price
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, pb: 2, px: 0 }}
                      >
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ py: 2, px: 0 }}>Room Charge</TableCell>
                      <TableCell align="center">1</TableCell>
                      <TableCell align="right">
                        {currency}
                        {currentInvoice.totalRoomCharge.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {currency}
                        {currentInvoice.totalRoomCharge.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {currentInvoice.usedServices?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ py: 2, px: 0 }}>{item.name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {currency}
                          {item.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {currency}
                          {item.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="right"
                        sx={{ py: 2, px: 0, fontWeight: 600 }}
                      >
                        Taxes
                      </TableCell>
                      <TableCell align="right">
                        {currency}
                        {currentInvoice.taxAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow
                      className="p-total-row"
                      sx={{
                        background: theme.palette.primary.main,
                        "& td": { border: 0 },
                      }}
                    >
                      <TableCell
                        colSpan={3}
                        align="right"
                        sx={{ py: 2, px: 1, fontWeight: 800, fontSize: "1rem" }}
                      >
                        TOTAL DUE
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 900, fontSize: "1.1rem", px: 0 }}
                      >
                        {currency}
                        {currentInvoice.totalAmountDue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="flex-end">
                <Box minWidth={200}>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="body2"
                    textAlign="right"
                    fontWeight={800}
                    className={getStatusPrintClass(
                      currentInvoice.paymentStatus,
                    )}
                    sx={{
                      color: getStatusHexColor(currentInvoice.paymentStatus),
                    }}
                  >
                    {currentInvoice.paymentStatus.toUpperCase()}
                    {currentInvoice.paymentMethod
                      ? ` · ${currentInvoice.paymentMethod}`
                      : ""}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions className="no-print" sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenPrintDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            startIcon={<PrintIcon />}
            disabled={printLoading}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Print Invoice
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

export default InvoicesPage;