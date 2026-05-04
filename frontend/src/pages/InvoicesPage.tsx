import { useEffect, useState, useCallback, useMemo } from "react";
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
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Print as PrintIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  CalendarToday as CalendarTodayIcon,
  Badge as BadgeIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
  LocalOffer as LocalOfferIcon,
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

export interface IDiscountCode {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description?: string;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
}

export interface IAppliedDiscount {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discountAmount: number;
}

export interface IInvoice {
  _id: string;
  booking: any;
  createdBy?: ICreatedBy;
  usedServices: IInvoiceServiceItem[];
  totalRoomCharge: number;
  totalServiceCharge: number;
  subtotal: number;
  appliedDiscount?: IAppliedDiscount | null;
  discountAmount: number;
  taxableAmount: number;
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
    #invoice-print-area .p-discount-row td {
      background-color: #f0fdf4 !important;
      color: #166534 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #invoice-print-area .p-status-paid    { color: #16a34a !important; }
    #invoice-print-area .p-status-pending { color: #d97706 !important; }
    .no-print { display: none !important; }
  }
`;

const PAGE_SIZE = 10;

const getRoleColor = (role: string) => {
  const r = role?.toLowerCase();
  if (r === "admin")
    return { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
  if (r === "manager")
    return { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" };
  if (r === "receptionist")
    return { bg: "#ede9fe", color: "#5b21b6", border: "#ddd6fe" };
  if (r === "housekeeping")
    return { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" };
  return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
};

const CreatedByBadge = ({ user }: { user?: ICreatedBy }) => {
  if (!user)
    return (
      <Typography variant="caption" color="text.disabled">
        —
      </Typography>
    );
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const colors = getRoleColor(user.role);
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          fontSize: "0.65rem",
          fontWeight: 700,
          bgcolor: colors.bg,
          color: colors.color,
          border: `1px solid ${colors.border}`,
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography
          variant="body2"
          fontWeight={600}
          lineHeight={1.3}
          fontSize="0.8rem"
        >
          {user.firstName} {user.lastName}
        </Typography>
        <Typography
          variant="caption"
          lineHeight={1}
          sx={{
            fontSize: "0.68rem",
            px: 0.75,
            py: 0.25,
            borderRadius: 0.75,
            bgcolor: colors.bg,
            color: colors.color,
            border: `1px solid ${colors.border}`,
            fontWeight: 600,
            display: "inline-block",
            mt: 0.3,
          }}
        >
          {user.role}
        </Typography>
      </Box>
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

const StatusChip = ({ status }: { status: string }) => {
  const isPaid = status === "Paid";
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
        bgcolor: isPaid ? "#f0fdf4" : "#fffbeb",
        color: isPaid ? "#15803d" : "#b45309",
        border: `1px solid ${isPaid ? "#bbf7d0" : "#fde68a"}`,
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
          bgcolor: isPaid ? "#22c55e" : "#f59e0b",
          flexShrink: 0,
        }}
      />
      {status}
    </Box>
  );
};

const InvoiceIdBadge = ({ id }: { id: string }) => {
  const theme = useTheme();
  return (
    <Box
      component="span"
      sx={{
        fontFamily: "monospace",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor:
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "#f8fafc",
        color: "text.secondary",
        border: "1px solid",
        borderColor: "divider",
        display: "inline-block",
      }}
    >
      {id.slice(-8).toUpperCase()}
    </Box>
  );
};

const DiscountTag = ({ discount }: { discount: IAppliedDiscount }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 1,
      py: 0.35,
      borderRadius: 20,
      fontSize: "0.68rem",
      fontWeight: 700,
      bgcolor: "#f0fdf4",
      color: "#15803d",
      border: "1px solid #bbf7d0",
      whiteSpace: "nowrap",
    }}
  >
    <LocalOfferIcon sx={{ fontSize: 11 }} />
    {discount.code}
    <Box component="span" sx={{ opacity: 0.75, fontWeight: 600 }}>
      {discount.type === "percentage"
        ? `−${discount.value}%`
        : `−$${discount.discountAmount.toFixed(2)}`}
    </Box>
  </Box>
);

const InvoicesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { hotel } = useHotel();
  const currency = hotel?.currency ?? "$";

  const currentUserRole = (localStorage.getItem("role") ?? "").toLowerCase();
  const canManageDiscount = ["admin", "manager"].includes(currentUserRole);
  const isReceptionist = currentUserRole === "receptionist";

  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [availableServices, setAvailableServices] = useState<IService[]>([]);
  const [availableDiscountCodes, setAvailableDiscountCodes] = useState<
    IDiscountCode[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterInvoiceId, setFilterInvoiceId] = useState("");

  const [invoiceGuests, setInvoiceGuests] = useState<
    Record<string, IGuest | null>
  >({});
  const [guestsLoading, setGuestsLoading] = useState<Record<string, boolean>>(
    {},
  );

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openAddServiceDialog, setOpenAddServiceDialog] = useState(false);
  const [openDiscountDialog, setOpenDiscountDialog] = useState(false);
  const [showDiscountConfirm, setShowDiscountConfirm] = useState(false);

  const [currentInvoice, setCurrentInvoice] = useState<IInvoice | null>(null);
  const [currentGuest, setCurrentGuest] = useState<IGuest | null>(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [addServiceLoading, setAddServiceLoading] = useState(false);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [pendingDiscountCode, setPendingDiscountCode] = useState("");

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
      const [invoicesResult, servicesResult, discountsResult] =
        await Promise.allSettled([
          api.get("/invoices"),
          api.get("/services"),
          api.get("/hotel"),
        ]);
      if (invoicesResult.status === "rejected") {
        showSnackbar(
          invoicesResult.reason?.response?.data?.message ||
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
      if (discountsResult.status === "fulfilled") {
        const hotelData = discountsResult.value.data;
        const codes: IDiscountCode[] = hotelData?.discountCodes ?? [];
        const active = codes.filter((c) => {
          if (!c.isActive) return false;
          if (c.validUntil && new Date(c.validUntil) < new Date()) return false;
          if (c.usageLimit != null && c.usedCount >= c.usageLimit) return false;
          return true;
        });
        setAvailableDiscountCodes(active);
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

  const creatorOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { id: string; label: string }[] = [];
    invoices.forEach((inv) => {
      if (inv.createdBy && !seen.has(inv.createdBy._id)) {
        seen.add(inv.createdBy._id);
        options.push({
          id: inv.createdBy._id,
          label: `${inv.createdBy.firstName} ${inv.createdBy.lastName}`,
        });
      }
    });
    return options;
  }, [invoices]);

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.paymentStatus === "Paid").length;
    const pending = invoices.filter(
      (i) => i.paymentStatus === "Pending",
    ).length;
    const revenue = invoices
      .filter((i) => i.paymentStatus === "Paid")
      .reduce((sum, i) => sum + i.totalAmountDue, 0);
    return { total, paid, pending, revenue };
  }, [invoices]);

  const hasActiveFilters = filterStatus || filterCreatedBy || filterInvoiceId;
  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterCreatedBy("");
    setFilterInvoiceId("");
    setPage(1);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = filterStatus
        ? inv.paymentStatus.toLowerCase() === filterStatus.toLowerCase()
        : true;
      const matchesCreatedBy = filterCreatedBy
        ? inv.createdBy?._id === filterCreatedBy
        : true;
      const matchesInvoiceId = filterInvoiceId
        ? inv._id
            .slice(-8)
            .toUpperCase()
            .includes(filterInvoiceId.toUpperCase().trim())
        : true;
      return matchesStatus && matchesCreatedBy && matchesInvoiceId;
    });
  }, [invoices, filterStatus, filterCreatedBy, filterInvoiceId]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterCreatedBy, filterInvoiceId]);

  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  const paginated = filteredInvoices.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const getStatusPrintClass = (status: string) =>
    status === "Paid" ? "p-status-paid" : "p-status-pending";
  const getStatusHexColor = (status: string) =>
    status === "Paid" ? "#16a34a" : "#d97706";

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
    } catch {
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

  const handleOpenDiscount = (invoice: IInvoice) => {
    setCurrentInvoice(invoice);
    setDiscountCodeInput("");
    setOpenDiscountDialog(true);
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
        { serviceId: serviceData.serviceId, quantity: serviceData.quantity },
      );
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

  const handleApplyDiscount = async (code: string) => {
    if (!currentInvoice) return;
    setDiscountLoading(true);
    try {
      const response = await api.patch(
        `/invoices/${currentInvoice._id}/discount`,
        { discountCode: code },
      );
      const updated: IInvoice = response.data.invoice || response.data;
      setInvoices((prev) =>
        prev.map((inv) => (inv._id === updated._id ? updated : inv)),
      );
      setCurrentInvoice(updated);
      showSnackbar("Discount applied successfully", "success");
      setOpenDiscountDialog(false);
      fetchData();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to apply discount",
        "error",
      );
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRequestApplyDiscount = (code: string) => {
    if (isReceptionist) {
      setPendingDiscountCode(code);
      setShowDiscountConfirm(true);
    } else {
      handleApplyDiscount(code);
    }
  };

  const handleConfirmApplyDiscount = () => {
    setShowDiscountConfirm(false);
    handleApplyDiscount(pendingDiscountCode);
    setPendingDiscountCode("");
  };

  const handleRemoveDiscount = async () => {
    if (!currentInvoice) return;
    setDiscountLoading(true);
    try {
      const response = await api.delete(
        `/invoices/${currentInvoice._id}/discount`,
      );
      const updated: IInvoice = response.data.invoice || response.data;
      setInvoices((prev) =>
        prev.map((inv) => (inv._id === updated._id ? updated : inv)),
      );
      setCurrentInvoice(updated);
      setDiscountCodeInput("");
      showSnackbar("Discount removed successfully", "success");
      fetchData();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to remove discount",
        "error",
      );
    } finally {
      setDiscountLoading(false);
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

  const renderDiscountCell = (invoice: IInvoice) => {
    const isPaid = invoice.paymentStatus === "Paid";
    const hasDiscount = !!invoice.appliedDiscount;

    if (isReceptionist) {
      return hasDiscount ? (
        <DiscountTag discount={invoice.appliedDiscount!} />
      ) : (
        <Typography variant="caption" color="text.disabled" fontSize="0.72rem">
          —
        </Typography>
      );
    }

    if (canManageDiscount) {
      return (
        <Tooltip
          title={
            isPaid
              ? "Cannot modify discount on paid invoice"
              : hasDiscount
                ? "Manage discount"
                : "Apply discount"
          }
          arrow
        >
          <span>
            <IconButton
              size="small"
              disabled={isPaid}
              onClick={() => handleOpenDiscount(invoice)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: hasDiscount ? "#bbf7d0" : "divider",
                color: hasDiscount ? "#15803d" : "text.secondary",
                bgcolor: hasDiscount ? "#f0fdf4" : "transparent",
                "&:hover": {
                  bgcolor: hasDiscount ? "#dcfce7" : "#f8fafc",
                  borderColor: hasDiscount ? "#86efac" : "text.secondary",
                },
                "&.Mui-disabled": { opacity: 0.35 },
                transition: "all 0.15s",
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </span>
        </Tooltip>
      );
    }

    return null;
  };

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
          mb: 3,
          "@media print": { display: "none" },
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
            Invoices
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
            textAlign="left"
          >
            Manage guest billing and payments
          </Typography>
        </Box>
      </Box>

      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
          "@media print": { display: "none" },
        }}
      >
        <StatCard
          icon={<ReceiptIcon fontSize="small" />}
          label="Total Invoices"
          value={stats.total}
          iconBg="#eff6ff"
          iconColor="#2563eb"
        />
        {!isReceptionist && (
          <StatCard
            icon={<AttachMoneyIcon fontSize="small" />}
            label="Total Revenue"
            value={`${currency}${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            iconBg="#f0fdf4"
            iconColor="#16a34a"
            valueColor="#15803d"
          />
        )}
        <StatCard
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          label="Paid"
          value={stats.paid}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          valueColor="#15803d"
        />
        <StatCard
          icon={<HourglassEmptyIcon fontSize="small" />}
          label="Pending"
          value={stats.pending}
          iconBg="#fffbeb"
          iconColor="#d97706"
          valueColor="#b45309"
        />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          width: "100%",
          boxSizing: "border-box",
          border: `1px solid ${theme.palette.divider}`,
          "@media print": { display: "none" },
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flexWrap="wrap"
        >
          <TextField
            size="small"
            label="Search Invoice ID"
            placeholder="e.g. DB6D9144"
            value={filterInvoiceId}
            onChange={(e) => setFilterInvoiceId(e.target.value)}
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: filterInvoiceId ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setFilterInvoiceId("")}
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
              minWidth: 180,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
          >
            <InputLabel>Payment Status</InputLabel>
            <Select
              label="Payment Status"
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
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Paid">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#16a34a",
                    }}
                  />
                  Paid
                </Box>
              </MenuItem>
              <MenuItem value="Pending">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#d97706",
                    }}
                  />
                  Pending
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{
              minWidth: 220,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
          >
            <InputLabel>Created By</InputLabel>
            <Select
              label="Created By"
              value={filterCreatedBy}
              onChange={(e) => setFilterCreatedBy(e.target.value)}
              endAdornment={
                filterCreatedBy ? (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => setFilterCreatedBy("")}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            >
              <MenuItem value="">All Staff</MenuItem>
              {creatorOptions.map((opt) => {
                const creator = invoices.find(
                  (inv) => inv.createdBy?._id === opt.id,
                )?.createdBy;
                const colors = getRoleColor(creator?.role ?? "");
                return (
                  <MenuItem key={opt.id} value={opt.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          bgcolor: colors.bg,
                          color: colors.color,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {opt.label
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </Avatar>
                      {opt.label}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
        {hasActiveFilters && (
          <Box display="flex" gap={1} flexWrap="wrap" mt={1.5}>
            {filterInvoiceId && (
              <Chip
                label={`Invoice ID: ${filterInvoiceId.toUpperCase()}`}
                size="small"
                onDelete={() => setFilterInvoiceId("")}
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
            {filterCreatedBy && (
              <Chip
                label={`Created by: ${creatorOptions.find((o) => o.id === filterCreatedBy)?.label ?? "Unknown"}`}
                size="small"
                onDelete={() => setFilterCreatedBy("")}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Paper>

      {isMobile ? (
        <Box sx={{ "@media print": { display: "none" } }}>
          {filteredInvoices.length === 0 ? (
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
                const hasDiscount = !!invoice.appliedDiscount;
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
                      <StatusChip status={invoice.paymentStatus} />
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
                          <InvoiceIdBadge id={invoice._id} />
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
                        {(canManageDiscount ||
                          (isReceptionist && hasDiscount)) && (
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box display="flex" alignItems="center" gap={0.8}>
                              <LocalOfferIcon
                                sx={{ fontSize: 14, opacity: 0.55 }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={600}
                              >
                                DISCOUNT
                              </Typography>
                            </Box>
                            {renderDiscountCell(invoice)}
                          </Box>
                        )}
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
                          <Box textAlign="right">
                            {hasDiscount && (
                              <Typography
                                variant="caption"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "text.disabled",
                                  display: "block",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {currency}
                                {(
                                  invoice.totalAmountDue +
                                  (invoice.discountAmount ?? 0)
                                ).toFixed(2)}
                              </Typography>
                            )}
                            <Typography
                              variant="h6"
                              fontWeight={900}
                              color={
                                hasDiscount ? "error.main" : "success.main"
                              }
                              lineHeight={1}
                            >
                              {currency}
                              {invoice.totalAmountDue.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        mt={1.5}
                      >
                        {(canManageDiscount || isReceptionist) && (
                          <Tooltip
                            title={
                              invoice.paymentStatus === "Paid"
                                ? "Paid invoice"
                                : "Discount"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={invoice.paymentStatus === "Paid"}
                                onClick={() => handleOpenDiscount(invoice)}
                                sx={{
                                  bgcolor: hasDiscount
                                    ? "#f0fdf4"
                                    : "action.hover",
                                  borderRadius: "8px",
                                  color: hasDiscount
                                    ? "#15803d"
                                    : "warning.main",
                                  "&.Mui-disabled": { opacity: 0.35 },
                                }}
                              >
                                <LocalOfferIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        <Tooltip title="Add service">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenAddService(invoice)}
                            sx={{
                              bgcolor: "action.hover",
                              borderRadius: "8px",
                            }}
                          >
                            <AddCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update payment">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenPayment(invoice)}
                            sx={{
                              bgcolor: "action.hover",
                              borderRadius: "8px",
                            }}
                          >
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View invoice">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleOpenPrint(invoice)}
                            sx={{
                              bgcolor: "action.hover",
                              borderRadius: "8px",
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                  "Invoice ID",
                  "Guest",
                  "Issue Date",
                  "Created By",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((label, i) => (
                  <TableCell
                    key={label}
                    align={
                      i === 5
                        ? "right"
                        : i === 6
                          ? "center"
                          : i === 7
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
                      ...(i === 7 && { pr: 2.5 }),
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1}
                    >
                      <ReceiptIcon
                        sx={{ fontSize: 40, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        No invoices found
                      </Typography>
                      {hasActiveFilters && (
                        <Button
                          size="small"
                          onClick={handleClearFilters}
                          sx={{ mt: 0.5, textTransform: "none" }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((invoice, rowIdx) => {
                  const guest = invoiceGuests[invoice._id];
                  const isGuestLoading = guestsLoading[invoice._id];
                  const isEven = rowIdx % 2 === 0;
                  const hasDiscount = !!invoice.appliedDiscount;
                  return (
                    <TableRow
                      key={invoice._id}
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
                        <InvoiceIdBadge id={invoice._id} />
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        {isGuestLoading ? (
                          <Box>
                            <Skeleton variant="text" width={130} height={18} />
                            <Skeleton
                              variant="text"
                              width={90}
                              height={14}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        ) : guest ? (
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              fontSize="0.85rem"
                              lineHeight={1.3}
                            >
                              {guest.firstName} {guest.lastName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontSize="0.72rem"
                            >
                              {guest.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.disabled"
                            fontSize="0.82rem"
                          >
                            Unknown Guest
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontSize="0.82rem"
                        >
                          {new Date(invoice.issueDate).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <CreatedByBadge user={invoice.createdBy} />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.75 }}>
                        <Box>
                          {hasDiscount && (
                            <Typography
                              variant="caption"
                              sx={{
                                textDecoration: "line-through",
                                color: "text.disabled",
                                display: "block",
                                fontSize: "0.7rem",
                              }}
                            >
                              {currency}
                              {(
                                invoice.totalAmountDue +
                                (invoice.discountAmount ?? 0)
                              ).toFixed(2)}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            fontSize="0.9rem"
                            color={hasDiscount ? "error.main" : "text.primary"}
                          >
                            {currency}
                            {invoice.totalAmountDue.toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.75 }}>
                        <StatusChip status={invoice.paymentStatus} />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.75, pr: 2.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={0.75}
                        >
                          {(canManageDiscount || isReceptionist) && (
                            <Tooltip
                              title={
                                invoice.paymentStatus === "Paid"
                                  ? "Paid invoice"
                                  : hasDiscount
                                    ? "Manage discount"
                                    : "Apply discount"
                              }
                              arrow
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={invoice.paymentStatus === "Paid"}
                                  onClick={() => handleOpenDiscount(invoice)}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    border: "1px solid",
                                    borderColor: hasDiscount
                                      ? "#bbf7d0"
                                      : "divider",
                                    color: hasDiscount
                                      ? "#15803d"
                                      : "text.secondary",
                                    bgcolor: hasDiscount
                                      ? "#f0fdf4"
                                      : "transparent",
                                    "&:hover": {
                                      bgcolor: hasDiscount
                                        ? "#dcfce7"
                                        : "#f8fafc",
                                      borderColor: hasDiscount
                                        ? "#86efac"
                                        : "divider",
                                    },
                                    "&.Mui-disabled": { opacity: 0.35 },
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <LocalOfferIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          <Tooltip title="Add service" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenAddService(invoice)}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                                color: "#16a34a",
                                bgcolor: "transparent",
                                "&:hover": {
                                  bgcolor: "#f0fdf4",
                                  borderColor: "#bbf7d0",
                                },
                                transition: "all 0.15s",
                              }}
                            >
                              <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update payment" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenPayment(invoice)}
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
                              <PaymentIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View invoice" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenPrint(invoice)}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                                color: "#7c3aed",
                                bgcolor: "transparent",
                                "&:hover": {
                                  bgcolor: "#f5f3ff",
                                  borderColor: "#ddd6fe",
                                },
                                transition: "all 0.15s",
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 16 }} />
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
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filteredInvoices.length)}
                </strong>{" "}
                of <strong>{filteredInvoices.length}</strong> invoices
              </Typography>
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
        </TableContainer>
      )}

      <Dialog
        open={openDiscountDialog}
        onClose={() => !discountLoading && setOpenDiscountDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800} sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                bgcolor: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#15803d",
              }}
            >
              <LocalOfferIcon fontSize="small" />
            </Box>
            {currentInvoice?.appliedDiscount
              ? "Applied Discount"
              : "Apply Discount"}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentInvoice?.appliedDiscount ? (
            <Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  mb: 2,
                }}
              >
                <Typography
                  variant="caption"
                  color="#15803d"
                  fontWeight={700}
                  textTransform="uppercase"
                  display="block"
                  mb={1}
                >
                  Applied Discount
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={0.75}>
                  <Typography variant="body2" color="text.secondary">
                    Code
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    fontFamily="monospace"
                    letterSpacing="0.08em"
                    color="#15803d"
                  >
                    {currentInvoice.appliedDiscount.code}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.75}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentInvoice.appliedDiscount.type === "percentage"
                      ? `${currentInvoice.appliedDiscount.value}% off`
                      : `Fixed ${currency}${currentInvoice.appliedDiscount.value} off`}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Saved
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#15803d">
                    −{currency}
                    {currentInvoice.appliedDiscount.discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              {canManageDiscount && (
                <Typography variant="body2" color="text.secondary">
                  Remove this discount to apply a different one.
                </Typography>
              )}
              {isReceptionist && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    p: 1.75,
                    borderRadius: 2,
                    bgcolor: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#d97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: "0.7rem",
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      !
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="#92400e"
                    fontSize="0.82rem"
                  >
                    This discount has been applied. Only a manager or admin can
                    remove or change it.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box pt={0.5}>
              {canManageDiscount && (
                <Box mb={2}>
                  <TextField
                    label="Discount Code"
                    placeholder="e.g. SUMMER20"
                    fullWidth
                    autoFocus
                    value={discountCodeInput}
                    onChange={(e) =>
                      setDiscountCodeInput(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && discountCodeInput.trim())
                        handleRequestApplyDiscount(discountCodeInput.trim());
                    }}
                    inputProps={{
                      style: {
                        fontFamily: "monospace",
                        letterSpacing: "0.08em",
                        fontWeight: 700,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      mb: 0,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}
              {availableDiscountCodes.length > 0 ? (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    textTransform="uppercase"
                    display="block"
                    mb={1.25}
                  >
                    {isReceptionist
                      ? "Available Discount Codes"
                      : "Or choose from available codes"}
                  </Typography>
                  <Stack spacing={1}>
                    {availableDiscountCodes.map((dc) => (
                      <Box
                        key={dc._id}
                        onClick={() => {
                          if (!discountLoading)
                            handleRequestApplyDiscount(dc.code);
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid #bbf7d0",
                          bgcolor: "#f0fdf4",
                          cursor: discountLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                          transition: "all 0.15s",
                          "&:hover": {
                            bgcolor: "#dcfce7",
                            borderColor: "#86efac",
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 8px rgba(34,197,94,0.15)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocalOfferIcon
                            sx={{ fontSize: 16, color: "#15803d" }}
                          />
                          <Box>
                            <Typography
                              fontFamily="monospace"
                              fontWeight={800}
                              fontSize="0.9rem"
                              color="#15803d"
                              letterSpacing="0.06em"
                            >
                              {dc.code}
                            </Typography>
                            {dc.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontSize="0.67rem"
                              >
                                {dc.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.75}
                          flexShrink={0}
                        >
                          <Chip
                            label={
                              dc.type === "percentage"
                                ? `${dc.value}% OFF`
                                : `${currency}${dc.value.toFixed(2)} OFF`
                            }
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              bgcolor: "#15803d",
                              color: "#fff",
                              borderRadius: 1.5,
                            }}
                          />
                          {dc.usageLimit && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              fontSize="0.62rem"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {dc.usedCount}/{dc.usageLimit}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ py: 3, textAlign: "center" }}>
                  <LocalOfferIcon
                    sx={{ fontSize: 36, color: "text.disabled", mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No active discount codes available
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenDiscountDialog(false)}
            color="inherit"
            disabled={discountLoading}
            sx={{ fontWeight: 600 }}
          >
            {currentInvoice?.appliedDiscount && isReceptionist
              ? "Close"
              : "Cancel"}
          </Button>
          {currentInvoice?.appliedDiscount && canManageDiscount && (
            <Button
              onClick={handleRemoveDiscount}
              variant="outlined"
              color="error"
              disabled={discountLoading}
              sx={{ borderRadius: 2, fontWeight: 700, minWidth: 100 }}
            >
              {discountLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                "Remove"
              )}
            </Button>
          )}
          {!currentInvoice?.appliedDiscount &&
            canManageDiscount &&
            discountCodeInput.trim() && (
              <Button
                onClick={() =>
                  handleRequestApplyDiscount(discountCodeInput.trim())
                }
                variant="contained"
                disabled={discountLoading}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  minWidth: 100,
                  bgcolor: "#15803d",
                  "&:hover": { bgcolor: "#166534" },
                }}
              >
                {discountLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Apply"
                )}
              </Button>
            )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={showDiscountConfirm}
        onClose={() => !discountLoading && setShowDiscountConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800} sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                bgcolor: "#fffbeb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d97706",
                flexShrink: 0,
              }}
            >
              <LocalOfferIcon fontSize="small" />
            </Box>
            Confirm Discount
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box pt={0.5}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#fffbeb",
                border: "1px solid #fde68a",
                mb: 2,
              }}
            >
              <Typography
                fontFamily="monospace"
                fontWeight={900}
                fontSize="1.1rem"
                letterSpacing="0.08em"
                color="#92400e"
                display="block"
                mb={0.5}
              >
                {pendingDiscountCode}
              </Typography>
              <Typography variant="body2" color="#78350f" fontWeight={600}>
                {(() => {
                  const dc = availableDiscountCodes.find(
                    (d) => d.code === pendingDiscountCode,
                  );
                  if (!dc) return "";
                  return dc.type === "percentage"
                    ? `${dc.value}% off`
                    : `${currency}${dc.value.toFixed(2)} off`;
                })()}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                p: 1.75,
                borderRadius: 2,
                bgcolor: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: 0.1,
                }}
              >
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  !
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="#991b1b"
                  mb={0.4}
                >
                  This action cannot be undone
                </Typography>
                <Typography variant="body2" color="#b91c1c" fontSize="0.82rem">
                  Once you apply this discount code, you will not be able to
                  remove or change it. Only a manager or admin can modify
                  applied discounts.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setShowDiscountConfirm(false);
              setPendingDiscountCode("");
            }}
            color="inherit"
            disabled={discountLoading}
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmApplyDiscount}
            variant="contained"
            disabled={discountLoading}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 150,
              bgcolor: "#d97706",
              "&:hover": { bgcolor: "#b45309" },
            }}
          >
            {discountLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Yes, Apply Discount"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
        onClose={() => {
          setOpenAddServiceDialog(false);
          setSelectedService(null);
        }}
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
                      {(selectedService.price * serviceData.quantity).toFixed(
                        2,
                      )}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Taxable
                    </Typography>
                    <Chip
                      label={selectedService.isTaxable ? "Yes" : "No"}
                      size="small"
                      color={selectedService.isTaxable ? "warning" : "default"}
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => {
              setOpenAddServiceDialog(false);
              setSelectedService(null);
            }}
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
                      <TableCell sx={{ fontWeight: 700, pb: 1 }}>
                        Description
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, pb: 1 }}>
                        Qty
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, pb: 1 }}>
                        Unit Price
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, pb: 1 }}>
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ py: 2 }}>Room Charge</TableCell>
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
                        <TableCell sx={{ py: 2 }}>
                          {typeof item.service === "object"
                            ? (item.service as any).name
                            : item.name || "Service"}
                        </TableCell>
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
                    {currentInvoice.appliedDiscount && (
                      <TableRow
                        className="p-discount-row"
                        sx={{ bgcolor: "#f0fdf4" }}
                      >
                        <TableCell
                          colSpan={3}
                          sx={{ py: 1.5, color: "#15803d", fontWeight: 600 }}
                        >
                          <Box display="flex" alignItems="center" gap={0.75}>
                            <LocalOfferIcon sx={{ fontSize: 14 }} />
                            Discount ({currentInvoice.appliedDiscount.code}
                            {currentInvoice.appliedDiscount.type ===
                            "percentage"
                              ? ` · ${currentInvoice.appliedDiscount.value}% off`
                              : ""}
                            )
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "#15803d", fontWeight: 700 }}
                        >
                          −{currency}
                          {currentInvoice.appliedDiscount.discountAmount.toFixed(
                            2,
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="right"
                        sx={{ py: 2, fontWeight: 600 }}
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
                        sx={{ fontWeight: 900, fontSize: "1.1rem" }}
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
