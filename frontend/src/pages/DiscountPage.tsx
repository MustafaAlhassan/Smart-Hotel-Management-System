import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
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
  Skeleton,
  Avatar,
  InputAdornment,
  Tooltip,
  LinearProgress,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from "@mui/material";
import {
  LocalOffer as LocalOfferIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import api from "../services/api";
import { useHotel } from "../context/HotelContext";

interface IDiscountCode {
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

const emptyForm = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  description: "",
  minBookingAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
};

const DiscountFormFields = ({
  f,
  setF,
  currency,
}: {
  f: typeof emptyForm;
  setF: (v: typeof emptyForm) => void;
  currency: string;
}) => (
  <Box
    display="grid"
    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
    gap={2.5}
    pt={1}
  >
    <TextField
      label="Code *"
      placeholder="e.g. SUMMER25"
      value={f.code}
      onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
      inputProps={{
        style: {
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.1em",
        },
      }}
      fullWidth
      sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
    />
    <TextField
      select
      label="Discount Type *"
      value={f.type}
      onChange={(e) =>
        setF({
          ...f,
          type: e.target.value as "percentage" | "fixed",
          maxDiscountAmount:
            e.target.value === "fixed" ? "" : f.maxDiscountAmount,
        })
      }
      fullWidth
    >
      <MenuItem value="percentage">Percentage (%)</MenuItem>
      <MenuItem value="fixed">Fixed Amount</MenuItem>
    </TextField>
    <TextField
      label="Value *"
      type="number"
      placeholder={f.type === "percentage" ? "e.g. 15" : "e.g. 50.00"}
      value={f.value}
      onChange={(e) => setF({ ...f, value: e.target.value })}
      fullWidth
      InputProps={{
        startAdornment:
          f.type === "fixed" ? (
            <InputAdornment position="start">
              <Typography variant="body2" fontWeight={600}>
                {currency}
              </Typography>
            </InputAdornment>
          ) : null,
        endAdornment:
          f.type === "percentage" ? (
            <InputAdornment position="end">%</InputAdornment>
          ) : null,
      }}
    />
    {f.type === "percentage" && (
      <TextField
        label="Max Discount Amount"
        type="number"
        placeholder="e.g. 200.00"
        value={f.maxDiscountAmount}
        onChange={(e) => setF({ ...f, maxDiscountAmount: e.target.value })}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography variant="body2" fontWeight={600}>
                {currency}
              </Typography>
            </InputAdornment>
          ),
        }}
      />
    )}
    <TextField
      label="Min Booking Amount"
      type="number"
      placeholder="e.g. 100.00"
      value={f.minBookingAmount}
      onChange={(e) => setF({ ...f, minBookingAmount: e.target.value })}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Typography variant="body2" fontWeight={600}>
              {currency}
            </Typography>
          </InputAdornment>
        ),
      }}
    />
    <TextField
      label="Usage Limit"
      type="number"
      placeholder="e.g. 100"
      value={f.usageLimit}
      onChange={(e) => setF({ ...f, usageLimit: e.target.value })}
      fullWidth
    />
    <TextField
      label="Valid From"
      type="date"
      value={f.validFrom}
      onChange={(e) => setF({ ...f, validFrom: e.target.value })}
      InputLabelProps={{ shrink: true }}
      fullWidth
    />
    <TextField
      label="Valid Until"
      type="date"
      value={f.validUntil}
      onChange={(e) => setF({ ...f, validUntil: e.target.value })}
      InputLabelProps={{ shrink: true }}
      fullWidth
    />
    <TextField
      label="Description"
      placeholder="Optional description..."
      value={f.description}
      onChange={(e) => setF({ ...f, description: e.target.value })}
      fullWidth
      multiline
      rows={2}
      sx={{ gridColumn: "1 / -1" }}
    />
    <FormControlLabel
      control={
        <Switch
          checked={f.isActive}
          onChange={(e) => setF({ ...f, isActive: e.target.checked })}
          color="success"
        />
      }
      label="Active"
      sx={{ gridColumn: "1 / -1" }}
    />
  </Box>
);

const DiscountPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { hotel } = useHotel();
  const currency = hotel?.currency ?? "$";

  const [codes, setCodes] = useState<IDiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "expired" | "exhausted"
  >("all");

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState<IDiscountCode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/hotel");
      const hotelData = res.data;
      setCodes(hotelData?.discountCodes ?? []);
    } catch {
      showSnackbar("Failed to load discount codes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const getCodeStatus = (
    code: IDiscountCode,
  ): "active" | "inactive" | "expired" | "exhausted" => {
    if (!code.isActive) return "inactive";
    if (code.validUntil && new Date(code.validUntil) < new Date())
      return "expired";
    if (code.usageLimit != null && code.usedCount >= code.usageLimit)
      return "exhausted";
    return "active";
  };

  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const status = getCodeStatus(c);
      const matchesStatus =
        filterStatus === "all" ? true : status === filterStatus;
      const matchesSearch =
        searchQuery.trim() === ""
          ? true
          : c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description ?? "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [codes, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = codes.length;
    const active = codes.filter((c) => getCodeStatus(c) === "active").length;
    const expired = codes.filter((c) => getCodeStatus(c) === "expired").length;
    const exhausted = codes.filter(
      (c) => getCodeStatus(c) === "exhausted",
    ).length;
    const totalSaved = codes.reduce(
      (sum, c) => sum + c.usedCount * (c.type === "fixed" ? c.value : 0),
      0,
    );
    return { total, active, expired, exhausted, totalSaved };
  }, [codes]);

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setOpenCreateDialog(true);
  };

  const handleOpenEdit = (code: IDiscountCode) => {
    setSelectedCode(code);
    setForm({
      code: code.code,
      type: code.type,
      value: String(code.value),
      description: code.description ?? "",
      minBookingAmount: code.minBookingAmount
        ? String(code.minBookingAmount)
        : "",
      maxDiscountAmount: code.maxDiscountAmount
        ? String(code.maxDiscountAmount)
        : "",
      usageLimit: code.usageLimit ? String(code.usageLimit) : "",
      validFrom: code.validFrom ? code.validFrom.slice(0, 10) : "",
      validUntil: code.validUntil ? code.validUntil.slice(0, 10) : "",
      isActive: code.isActive,
    });
    setOpenEditDialog(true);
  };

  const handleOpenDelete = (code: IDiscountCode) => {
    setSelectedCode(code);
    setOpenDeleteDialog(true);
  };

  const buildPayload = (f: typeof emptyForm) => {
    const payload: Record<string, any> = {
      code: f.code.trim().toUpperCase(),
      type: f.type,
      value: parseFloat(f.value),
      isActive: f.isActive,
    };
    if (f.description.trim()) payload.description = f.description.trim();
    if (f.minBookingAmount)
      payload.minBookingAmount = parseFloat(f.minBookingAmount);
    if (f.maxDiscountAmount && f.type === "percentage")
      payload.maxDiscountAmount = parseFloat(f.maxDiscountAmount);
    if (f.usageLimit) payload.usageLimit = parseInt(f.usageLimit);
    if (f.validFrom) payload.validFrom = f.validFrom;
    if (f.validUntil) payload.validUntil = f.validUntil;
    return payload;
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      await api.post("/hotel/discounts", buildPayload(form));
      showSnackbar("Discount code created successfully", "success");
      setOpenCreateDialog(false);
      fetchCodes();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to create discount code",
        "error",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCode) return;
    setEditLoading(true);
    try {
      await api.put(
        `/hotel/discounts/${selectedCode.code}`,
        buildPayload(form),
      );
      showSnackbar("Discount code updated successfully", "success");
      setOpenEditDialog(false);
      fetchCodes();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to update discount code",
        "error",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCode) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/hotel/discounts/${selectedCode.code}`);
      showSnackbar("Discount code deleted", "success");
      setOpenDeleteDialog(false);
      fetchCodes();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to delete",
        "error",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (code: IDiscountCode) => {
    try {
      await api.put(`/hotel/discounts/${code.code}`, {
        isActive: !code.isActive,
      });
      setCodes((prev) =>
        prev.map((c) =>
          c._id === code._id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
      showSnackbar(
        `Code ${code.isActive ? "deactivated" : "activated"}`,
        "success",
      );
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to update",
        "error",
      );
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    showSnackbar("Copied to clipboard", "success");
  };

  const statusConfig = {
    active: {
      label: "Active",
      bgcolor: "#dcfce7",
      color: "#166534",
      dot: "#22c55e",
    },
    inactive: {
      label: "Inactive",
      bgcolor: "#f1f5f9",
      color: "#64748b",
      dot: "#94a3b8",
    },
    expired: {
      label: "Expired",
      bgcolor: "#fef2f2",
      color: "#991b1b",
      dot: "#ef4444",
    },
    exhausted: {
      label: "Exhausted",
      bgcolor: "#fef9c3",
      color: "#854d0e",
      dot: "#eab308",
    },
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={3}
        gap={2}
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing={-0.5}
            sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
          >
            Discount Codes
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create and manage promotional discount codes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: "none",
            px: 2.5,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Create Code
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
        {[
          {
            label: "Total Codes",
            value: stats.total,
            bg: "#eff6ff",
            color: "#2563eb",
          },
          {
            label: "Active",
            value: stats.active,
            bg: "#f0fdf4",
            color: "#16a34a",
          },
          {
            label: "Expired",
            value: stats.expired,
            bg: "#fef2f2",
            color: "#dc2626",
          },
          {
            label: "Exhausted",
            value: stats.exhausted,
            bg: "#fef9c3",
            color: "#d97706",
          },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
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
              {s.label}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{ color: s.color, mt: 0.5 }}
            >
              {s.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <FilterListIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Filter & Search
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {(
              ["all", "active", "inactive", "expired", "exhausted"] as const
            ).map((s) => (
              <Chip
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                onClick={() => setFilterStatus(s)}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  bgcolor:
                    filterStatus === s
                      ? theme.palette.primary.main
                      : "transparent",
                  color: filterStatus === s ? "#fff" : "text.secondary",
                  border: "1px solid",
                  borderColor:
                    filterStatus === s ? theme.palette.primary.main : "divider",
                  transition: "all 0.15s",
                  "&:hover": {
                    bgcolor:
                      filterStatus === s
                        ? theme.palette.primary.dark
                        : "action.hover",
                  },
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={200}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : filteredCodes.length === 0 ? (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "#f1f5f9",
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 32, color: "text.disabled" }} />
          </Avatar>
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            No discount codes found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your filters"
              : "Create your first discount code to get started"}
          </Typography>
          {!searchQuery && filterStatus === "all" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                mt: 1,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Create Code
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {filteredCodes.map((code) => {
            const status = getCodeStatus(code);
            const sc = statusConfig[status];
            const usagePct = code.usageLimit
              ? Math.min((code.usedCount / code.usageLimit) * 100, 100)
              : 0;
            const isActive = status === "active";

            return (
              <Card
                key={code._id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: isActive ? "#bbf7d0" : "divider",
                  bgcolor: isActive
                    ? theme.palette.mode === "dark"
                      ? "rgba(34,197,94,0.05)"
                      : "#f0fdf4"
                    : "transparent",
                  opacity: isActive ? 1 : 0.75,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                    borderColor: isActive ? "#86efac" : theme.palette.divider,
                  },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1.25}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={0.75}
                      minWidth={0}
                    >
                      <Typography
                        fontFamily="monospace"
                        fontWeight={900}
                        fontSize="1.05rem"
                        letterSpacing="0.07em"
                        color={isActive ? "#15803d" : "text.secondary"}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {code.code}
                      </Typography>
                      <Tooltip title="Copy code" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(code.code)}
                          sx={{
                            width: 22,
                            height: 22,
                            color: "text.disabled",
                            flexShrink: 0,
                            "&:hover": { color: "text.primary" },
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box display="flex" gap={0.5} flexShrink={0}>
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(code)}
                          sx={{
                            width: 26,
                            height: 26,
                            "&:hover": {
                              color: theme.palette.primary.main,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.08)"
                                  : "#eff6ff",
                            },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(code)}
                          sx={{
                            width: 26,
                            height: 26,
                            "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box display="flex" gap={0.75} flexWrap="wrap" mb={1.25}>
                    <Chip
                      label={
                        code.type === "percentage"
                          ? `${code.value}% OFF`
                          : `${currency}${code.value.toFixed(2)} OFF`
                      }
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        borderRadius: 1.5,
                        bgcolor: isActive
                          ? "#15803d"
                          : "action.disabledBackground",
                        color: isActive ? "#fff" : "text.disabled",
                      }}
                    />
                    {code.type === "percentage" && code.maxDiscountAmount && (
                      <Chip
                        label={`Max ${currency}${code.maxDiscountAmount.toFixed(2)}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 22,
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          borderRadius: 1.5,
                          borderColor: "divider",
                          color: "text.secondary",
                        }}
                      />
                    )}
                    {code.minBookingAmount != null &&
                      code.minBookingAmount > 0 && (
                        <Chip
                          label={`Min ${currency}${code.minBookingAmount.toFixed(2)}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: "0.62rem",
                            fontWeight: 600,
                            borderRadius: 1.5,
                            borderColor: "divider",
                            color: "text.secondary",
                          }}
                        />
                      )}
                  </Box>

                  {code.usageLimit != null && (
                    <Box mb={1}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={0.4}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          fontSize="0.63rem"
                        >
                          Usage
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          fontSize="0.63rem"
                          color={
                            status === "exhausted"
                              ? "#dc2626"
                              : "text.secondary"
                          }
                        >
                          {code.usedCount} / {code.usageLimit}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={usagePct}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.08)"
                              : "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 2,
                            bgcolor:
                              status === "exhausted"
                                ? "#dc2626"
                                : isActive
                                  ? "#22c55e"
                                  : "#9ca3af",
                          },
                        }}
                      />
                    </Box>
                  )}

                  {code.usageLimit == null && code.usedCount > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.65rem"
                      display="block"
                      mb={1}
                    >
                      Used {code.usedCount} time
                      {code.usedCount !== 1 ? "s" : ""}
                    </Typography>
                  )}

                  {code.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.67rem"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 1,
                      }}
                    >
                      {code.description}
                    </Typography>
                  )}

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={1}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: sc.dot,
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        fontSize="0.65rem"
                        sx={{ color: sc.color }}
                      >
                        {sc.label}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      {code.validUntil && (
                        <Typography
                          variant="caption"
                          fontSize="0.6rem"
                          color="text.disabled"
                        >
                          until{" "}
                          {new Date(code.validUntil).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "2-digit" },
                          )}
                        </Typography>
                      )}
                      <Tooltip
                        title={code.isActive ? "Deactivate" : "Activate"}
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(code)}
                          sx={{
                            width: 26,
                            height: 26,
                            color: code.isActive ? "#15803d" : "text.disabled",
                            "&:hover": {
                              bgcolor: code.isActive
                                ? "#dcfce7"
                                : "action.hover",
                            },
                          }}
                        >
                          {code.isActive ? (
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <CancelIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle fontWeight={800}>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon sx={{ fontSize: 22 }} />
            Create Discount Code
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DiscountFormFields f={form} setF={setForm} currency={currency} />
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!form.code.trim() || !form.value || createLoading}
            sx={{ borderRadius: 2, fontWeight: 700, minWidth: 130 }}
          >
            {createLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Create Code"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle fontWeight={800}>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon sx={{ fontSize: 22 }} />
            Edit Discount Code
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DiscountFormFields f={form} setF={setForm} currency={currency} />
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={!form.code.trim() || !form.value || editLoading}
            sx={{ borderRadius: 2, fontWeight: 700, minWidth: 130 }}
          >
            {editLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Delete Discount Code</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Are you sure you want to delete{" "}
            <strong
              style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
            >
              {selectedCode?.code}
            </strong>
            ? This action cannot be undone.
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
            onClick={handleDelete}
            variant="contained"
            disabled={deleteLoading}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 90,
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
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

export default DiscountPage;
