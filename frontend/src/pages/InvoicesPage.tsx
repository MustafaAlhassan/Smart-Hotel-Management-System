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
  Stack,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  Print as PrintIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from "@mui/icons-material";
import api from "../services/api";

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
}

export interface IInvoiceServiceItem {
  service: { _id: string; name: string };
  quantity: number;
  price: number;
  total: number;
  _id?: string;
}

export interface IInvoice {
  _id: string;
  booking: any;
  usedServices: IInvoiceServiceItem[];
  totalRoomCharge: number;
  totalServiceCharge: number;
  taxAmount: number;
  totalAmountDue: number;
  paymentStatus: "Paid" | "Pending" | "Partially Paid";
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

    /* Default all text inside print area to dark */
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

    /* Muted / secondary text */
    #invoice-print-area .p-secondary {
      color: #475569 !important;
    }

    /* Table header */
    #invoice-print-area .p-thead th {
      background-color: #f1f5f9 !important;
      color: #334155 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Total row */
    #invoice-print-area .p-total-row td {
      background-color: #1e293b !important;
      color: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Payment status */
    #invoice-print-area .p-status-paid    { color: #16a34a !important; }
    #invoice-print-area .p-status-partial { color: #0284c7 !important; }
    #invoice-print-area .p-status-pending { color: #d97706 !important; }

    /* Hide buttons */
    .no-print { display: none !important; }
  }
`;

const InvoicesPage = () => {
  const theme = useTheme();

  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [availableServices, setAvailableServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);

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
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch invoices";
        console.error("Invoices fetch error:", err);
        showSnackbar(msg, "error");
        return;
      }

      const fetchedInvoices: IInvoice[] = invoicesResult.value.data;
      setInvoices(fetchedInvoices);

      if (servicesResult.status === "fulfilled") {
        const sData = servicesResult.value.data;
        setAvailableServices(sData.data || sData);
      } else {
        console.error("Services fetch error:", servicesResult.reason);
      }

      resolveGuestsForInvoices(fetchedInvoices);
    } catch (error: any) {
      console.error("fetchData error:", error);
      showSnackbar(error?.message || "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  }, [resolveGuestsForInvoices]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusChipColor = (status: string) => {
    if (status === "Paid") return "success";
    if (status === "Partially Paid") return "info";
    return "warning";
  };

  const getStatusPrintClass = (status: string) => {
    if (status === "Paid") return "p-status-paid";
    if (status === "Partially Paid") return "p-status-partial";
    return "p-status-pending";
  };

  const getStatusHexColor = (status: string) => {
    if (status === "Paid") return "#16a34a";
    if (status === "Partially Paid") return "#0284c7";
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
      await api.patch(`/invoices/${currentInvoice._id}/services`, {
        serviceId: serviceData.serviceId,
        quantity: serviceData.quantity,
      });
      showSnackbar("Service added successfully", "success");
      setOpenAddServiceDialog(false);
      fetchData();
    } catch (error: any) {
      console.error("Add Service Error:", error);
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
        p: { xs: 2, md: 5 },
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        "@media print": { display: openPrintDialog ? "block" : "none", p: 0 },
      }}
    >
      <style>{PRINT_STYLES}</style>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={5}
        sx={{ "@media print": { display: "none" } }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing={-0.5}>
            Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage guest billing and payments
          </Typography>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
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
                "Total Amount",
                "Status",
                "Actions",
              ].map((h) => (
                <TableCell
                  key={h}
                  align={
                    h === "Actions" || h === "Total Amount" ? "right" : "left"
                  }
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
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
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const guest = invoiceGuests[invoice._id];
                const isGuestLoading = guestsLoading[invoice._id];
                return (
                  <TableRow
                    key={invoice._id}
                    sx={{
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
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={800}>
                        ${invoice.totalAmountDue.toFixed(2)}
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
              {["Paid", "Pending", "Partially Paid"].map((s) => (
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
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPaymentDialog(false)} color="inherit">
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
        onClose={() => setOpenAddServiceDialog(false)}
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
              onChange={(e) =>
                setServiceData({ ...serviceData, serviceId: e.target.value })
              }
            >
              {availableServices.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name} — ${s.price}
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
                  quantity: parseInt(e.target.value) || 1,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenAddServiceDialog(false)}
            color="inherit"
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
        <DialogContent sx={{ p: { xs: 3, md: 6 } }}>
          {currentInvoice && (
            <Box id="invoice-print-area">
              <Box display="flex" justifyContent="space-between" mb={6}>
                <Box>
                  <Typography variant="h3" fontWeight={900} letterSpacing={-1}>
                    INVOICE
                  </Typography>
                  <Typography
                    variant="body1"
                    className="p-secondary"
                    color="text.secondary"
                    mt={1}
                  >
                    ID: {currentInvoice._id.toUpperCase()}
                  </Typography>
                  <Typography
                    variant="body1"
                    className="p-secondary"
                    color="text.secondary"
                  >
                    Date:{" "}
                    {new Date(currentInvoice.issueDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" fontWeight={800}>
                    AMI Hotel
                  </Typography>
                  <Typography
                    variant="body2"
                    className="p-secondary"
                    color="text.secondary"
                  >
                    E-mail: ami@hotel.com
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
                      Passport/ID: {currentGuest.idNumber || "N/A"}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" fontWeight={600} mt={0.5}>
                    Guest details unavailable
                  </Typography>
                )}
              </Box>

              <TableContainer sx={{ mb: 4 }}>
                <Table size="small">
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
                        ${currentInvoice.totalRoomCharge.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${currentInvoice.totalRoomCharge.toFixed(2)}
                      </TableCell>
                    </TableRow>

                    {currentInvoice.usedServices?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ py: 2, px: 0 }}>
                          {item.service?.name}
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${item.total.toFixed(2)}
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
                        ${currentInvoice.taxAmount.toFixed(2)}
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
                        sx={{
                          py: 2,
                          px: 1,
                          fontWeight: 800,
                          fontSize: "1rem",
                        }}
                      >
                        TOTAL DUE
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 900,
                          fontSize: "1.1rem",
                          px: 0,
                        }}
                      >
                        ${currentInvoice.totalAmountDue.toFixed(2)}
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

        <DialogActions className="no-print" sx={{ p: 3 }}>
          <Button onClick={() => setOpenPrintDialog(false)} color="inherit">
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
      >
        <Alert
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
