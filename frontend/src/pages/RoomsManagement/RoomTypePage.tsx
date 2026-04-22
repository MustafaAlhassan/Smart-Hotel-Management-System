import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Stack,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  InputAdornment,
  CircularProgress,
  alpha,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Pagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  CheckCircle as AmenityIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  Lock as LockIcon,
  Clear as ClearIcon,
  Hotel as HotelIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { roomTypeService } from "../../services/roomTypeService";
import type { IRoomType } from "../../types/types";
import { useHotel } from "../../context/HotelContext";

const PAGE_SIZE = 10;

const RoomTypesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const { hotel } = useHotel();

  const role = (localStorage.getItem("role") || "").toUpperCase();
  const isReceptionist = role === "RECEPTIONIST";
  const canEdit = role === "ADMIN" || role === "MANAGER";

  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingItem, setViewingItem] = useState<IRoomType | null>(null);
  const [editingItem, setEditingItem] = useState<IRoomType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "price_asc" | "price_desc" | "capacity"
  >("name");
  const [amenityFilter, setAmenityFilter] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    name: "",
    basePrice: "" as string | number,
    capacity: "" as string | number,
    description: "",
    featuresInput: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await roomTypeService.getAllRoomTypes();
      if (Array.isArray(response)) {
        setRoomTypes(response);
      } else if (response && Array.isArray((response as any).data)) {
        setRoomTypes((response as any).data);
      } else {
        setRoomTypes([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch room types");
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allAmenities = Array.from(
    new Set(roomTypes.flatMap((t) => t.amenities || [])),
  );

  const filtered = roomTypes
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.amenities || []).some((a) => a.toLowerCase().includes(q));
      const matchAmenity =
        !amenityFilter || (t.amenities || []).includes(amenityFilter);
      return matchSearch && matchAmenity;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.basePrice - b.basePrice;
      if (sortBy === "price_desc") return b.basePrice - a.basePrice;
      if (sortBy === "capacity") return b.capacity - a.capacity;
      return a.name.localeCompare(b.name);
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = !!searchQuery || !!amenityFilter || sortBy !== "name";

  const clearFilters = () => {
    setSearchQuery("");
    setAmenityFilter("");
    setSortBy("name");
    setPage(1);
  };

  const handleOpenDialog = (item?: IRoomType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        basePrice: item.basePrice,
        capacity: item.capacity,
        description: item.description || "",
        featuresInput: (item.amenities || []).join(", "),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        basePrice: "",
        capacity: "",
        description: "",
        featuresInput: "",
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      formData.basePrice === "" ||
      formData.capacity === ""
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }
    try {
      setSubmitLoading(true);
      const amenities = formData.featuresInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: formData.name,
        basePrice: Number(formData.basePrice),
        capacity: Number(formData.capacity),
        description: formData.description,
        amenities,
      };
      if (editingItem) {
        await roomTypeService.updateRoomType(editingItem._id, payload);
        setSnackbar({
          open: true,
          message: "Room type updated successfully",
          severity: "success",
        });
      } else {
        await roomTypeService.createRoomType(payload);
        setSnackbar({
          open: true,
          message: "Room type created successfully",
          severity: "success",
        });
      }
      setOpenDialog(false);
      fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Operation failed",
        severity: "error",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!idToDelete) return;
    try {
      await roomTypeService.deleteRoomType(idToDelete);
      setSnackbar({
        open: true,
        message: "Deleted successfully",
        severity: "success",
      });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally {
      setDeleteConfirmOpen(false);
      setIdToDelete(null);
    }
  };

  const surface = isDark ? alpha("#fff", 0.03) : "#fff";
  const border = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.07);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="60vh"
      >
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: { xs: 2, md: 4 }, pb: 8, px: { xs: 2, sm: 3 } }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            letterSpacing={-0.5}
            mb={0.5}
            sx={{ fontSize: { xs: "1.55rem", md: "2rem", textAlign: "left" } }}
          >
            Rooms Types
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "left" }}
          >
            {isReceptionist
              ? "Browse available room types and their details."
              : "Manage room categories, pricing, and amenities."}
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.4,
              textTransform: "none",
              fontSize: "0.92rem",
              fontWeight: 700,
              boxShadow: 4,
              whiteSpace: "nowrap",
            }}
          >
            Add New Type
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          borderRadius: 3,
          border: `1px solid ${border}`,
          bgcolor: isDark
            ? alpha("#fff", 0.03)
            : alpha(theme.palette.primary.main, 0.02),
          overflow: "hidden",
        }}
      >
        <Box
          onClick={() => isMobile && setFiltersOpen((p) => !p)}
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: isMobile ? "pointer" : "default",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterIcon sx={{ fontSize: 17, color: "text.secondary" }} />
            <Typography variant="body2" fontWeight={700} color="text.secondary">
              Filters & Search
            </Typography>
            {hasFilters && (
              <Chip
                label="Active"
                size="small"
                color="primary"
                sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700 }}
              />
            )}
          </Stack>
          {isMobile && (
            <IconButton size="small" sx={{ p: 0.5 }}>
              {filtersOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>

        <Collapse in={isMobile ? filtersOpen : true}>
          <Box
            sx={{
              px: { xs: 2, md: 2.5 },
              pb: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: { sm: "wrap" },
              gap: { xs: 2, sm: 1.5 },
            }}
          >
            <TextField
              placeholder="Search name, description, amenity…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              size="small"
              fullWidth={isMobile}
              sx={{ flex: { sm: "2 1 200px" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: "text.disabled" }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchQuery("");
                        setPage(1);
                      }}
                    >
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: 2, bgcolor: surface },
              }}
            />

            <FormControl
              size="small"
              fullWidth={isMobile}
              sx={{ flex: { sm: "1 1 140px" } }}
            >
              <InputLabel>Amenity</InputLabel>
              <Select
                value={amenityFilter}
                label="Amenity"
                onChange={(e) => {
                  setAmenityFilter(e.target.value);
                  setPage(1);
                }}
                sx={{ borderRadius: 2, bgcolor: surface }}
              >
                <MenuItem value="">All Amenities</MenuItem>
                {allAmenities.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              fullWidth={isMobile}
              sx={{ flex: { sm: "1 1 150px" } }}
            >
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setPage(1);
                }}
                sx={{ borderRadius: 2, bgcolor: surface }}
              >
                <MenuItem value="name">Name (A–Z)</MenuItem>
                <MenuItem value="price_asc">Price: Low → High</MenuItem>
                <MenuItem value="price_desc">Price: High → Low</MenuItem>
                <MenuItem value="capacity">Capacity</MenuItem>
              </Select>
            </FormControl>

            {hasFilters && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                onClick={clearFilters}
                fullWidth={isMobile}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  alignSelf: { sm: "center" },
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Collapse>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filtered.length} {filtered.length === 1 ? "type" : "types"} found
        {totalPages > 1 && ` — page ${page} of ${totalPages}`}
      </Typography>

      {filtered.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, md: 10 },
            borderRadius: 3,
            border: `1px dashed ${border}`,
          }}
        >
          <HotelIcon sx={{ fontSize: 52, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            No room types found
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={0.5}>
            {hasFilters
              ? "Try adjusting your filters"
              : "Add your first room type to get started"}
          </Typography>
          {hasFilters && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: { xs: 2, md: 3 },
            }}
          >
            {paginated.map((type) => (
              <Box
                key={type._id}
                sx={{
                  borderRadius: { xs: 3, md: 4 },
                  border: `1px solid ${border}`,
                  bgcolor: surface,
                  boxShadow: isDark
                    ? "0 4px 24px rgba(0,0,0,0.35)"
                    : "0 2px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: { sm: "translateY(-3px)" },
                    boxShadow: isDark
                      ? "0 10px 36px rgba(0,0,0,0.55)"
                      : "0 8px 32px rgba(0,0,0,0.11)",
                  },
                }}
              >
                <Box
                  sx={{
                    px: { xs: 2.5, md: 3 },
                    pt: { xs: 2.5, md: 3 },
                    pb: 2,
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.07)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
                    borderBottom: `1px solid ${border}`,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1}
                    mb={1.5}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      <HotelIcon
                        sx={{ color: theme.palette.primary.main, fontSize: 21 }}
                      />
                    </Box>
                    <Stack
                      direction="row"
                      gap={0.7}
                      flexWrap="wrap"
                      justifyContent="flex-end"
                    >
                      <Chip
                        icon={
                          <MoneyIcon sx={{ fontSize: "13px !important" }} />
                        }
                        label={`${hotel?.currency}${type.basePrice}/night`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          flexShrink: 0,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                          "& .MuiChip-icon": {
                            color: theme.palette.success.main,
                          },
                        }}
                      />
                      <Chip
                        label={`${(type as any).roomCount ?? 0} ${((type as any).roomCount ?? 0) === 1 ? "Room" : "Rooms"}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          flexShrink: 0,
                          bgcolor:
                            (type as any).roomCount > 0
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha("#000", 0.04),
                          color:
                            (type as any).roomCount > 0
                              ? theme.palette.primary.main
                              : "text.disabled",
                          border: `1px solid ${(type as any).roomCount > 0 ? alpha(theme.palette.primary.main, 0.25) : border}`,
                        }}
                      />
                    </Stack>
                  </Box>

                  <Typography
                    fontWeight={800}
                    letterSpacing={-0.3}
                    lineHeight={1.25}
                    mb={0.5}
                    sx={{
                      fontSize: { xs: "1rem", md: "1.05rem" },
                      wordBreak: "break-word",
                    }}
                  >
                    {type.name}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PeopleIcon
                      sx={{ fontSize: 13, color: "text.secondary" }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Up to {type.capacity}{" "}
                      {type.capacity === 1 ? "person" : "persons"}
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    px: { xs: 2.5, md: 3 },
                    py: 2.5,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.disabled"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        display: "block",
                        mb: 0.6,
                      }}
                    >
                      Description
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      lineHeight={1.7}
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                      }}
                    >
                      {type.description ||
                        "No description provided for this room type."}
                    </Typography>
                  </Box>

                  {type.amenities && type.amenities.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.disabled"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          display: "block",
                          mb: 0.6,
                        }}
                      >
                        Amenities
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.6}>
                        {type.amenities.slice(0, 4).map((amenity, idx) => (
                          <Chip
                            key={idx}
                            label={amenity}
                            size="small"
                            icon={
                              <AmenityIcon
                                sx={{ fontSize: "11px !important" }}
                              />
                            }
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              height: 22,
                              borderRadius: 1.5,
                              maxWidth: "100%",
                              bgcolor: isDark
                                ? alpha("#fff", 0.05)
                                : alpha(theme.palette.primary.main, 0.05),
                              color: "text.secondary",
                              border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha(theme.palette.primary.main, 0.15)}`,
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                              "& .MuiChip-icon": {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        ))}
                        {type.amenities.length > 4 && (
                          <Chip
                            label={`+${type.amenities.length - 4}`}
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              height: 22,
                              borderRadius: 1.5,
                              color: "text.disabled",
                              border: `1px solid ${border}`,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ opacity: 0.5 }} />

                <Box
                  sx={{
                    px: { xs: 2.5, md: 3 },
                    py: 2,
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      <ViewIcon sx={{ fontSize: "15px !important" }} />
                    }
                    onClick={() => {
                      setViewingItem(type);
                      setViewDialog(true);
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    View
                  </Button>

                  {canEdit && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          <EditIcon sx={{ fontSize: "15px !important" }} />
                        }
                        onClick={() => handleOpenDialog(type)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        Edit
                      </Button>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setIdToDelete(type._id);
                            setDeleteConfirmOpen(true);
                          }}
                          sx={{
                            borderRadius: 2,
                            flexShrink: 0,
                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                            bgcolor: alpha(theme.palette.error.main, 0.04),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {isReceptionist && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        px: 1.2,
                        py: 0.6,
                        borderRadius: 1.5,
                        flexShrink: 0,
                        bgcolor: alpha(theme.palette.info.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                      }}
                    >
                      <LockIcon sx={{ fontSize: 11, color: "info.main" }} />
                      <Typography
                        variant="caption"
                        color="info.main"
                        fontWeight={700}
                        sx={{ fontSize: "0.62rem" }}
                      >
                        View Only
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => {
                  setPage(value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                color="primary"
                shape="rounded"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </>
      )}

      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 } },
        }}
      >
        {viewingItem && (
          <>
            <DialogTitle sx={{ pt: { xs: 2.5, sm: 2 }, pb: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                flexWrap="wrap"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1.5}
                  sx={{ minWidth: 0 }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      flexShrink: 0,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <HotelIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ wordBreak: "break-word", lineHeight: 1.3 }}
                  >
                    {viewingItem.name}
                  </Typography>
                </Stack>
                <Chip
                  icon={<MoneyIcon sx={{ fontSize: "13px !important" }} />}
                  label={`${hotel?.currency}${viewingItem.basePrice}/night`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                    "& .MuiChip-icon": { color: theme.palette.success.main },
                  }}
                />
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ px: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={4} flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "block",
                        mb: 0.4,
                      }}
                    >
                      Capacity
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PeopleIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body1" fontWeight={700}>
                        {viewingItem.capacity}{" "}
                        {viewingItem.capacity === 1 ? "person" : "persons"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "block",
                        mb: 0.4,
                      }}
                    >
                      Price
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="success.main"
                    >
                      {hotel?.currency}
                      {viewingItem.basePrice}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {" "}
                        / night
                      </Typography>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "block",
                        mb: 0.4,
                      }}
                    >
                      Rooms
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color={
                        (viewingItem as any).roomCount > 0
                          ? "primary.main"
                          : "text.disabled"
                      }
                    >
                      {(viewingItem as any).roomCount ?? 0}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "block",
                      mb: 0.75,
                    }}
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    lineHeight={1.75}
                  >
                    {viewingItem.description || "No description provided."}
                  </Typography>
                </Box>

                {viewingItem.amenities && viewingItem.amenities.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "block",
                        mb: 0.75,
                      }}
                    >
                      Amenities ({viewingItem.amenities.length})
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {viewingItem.amenities.map((a, idx) => (
                        <Chip
                          key={idx}
                          label={a}
                          size="small"
                          icon={
                            <AmenityIcon sx={{ fontSize: "13px !important" }} />
                          }
                          variant="outlined"
                          color="primary"
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {isReceptionist && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.06),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <InfoIcon
                      sx={{ fontSize: 16, color: "info.main", flexShrink: 0 }}
                    />
                    <Typography
                      variant="caption"
                      color="info.main"
                      fontWeight={500}
                    >
                      View only — contact management to make changes.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3 }}>
              <Button
                variant="contained"
                fullWidth={isMobile}
                onClick={() => setViewDialog(false)}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Add / Edit dialog ── */}
      {canEdit && (
        <>
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
            PaperProps={{
              sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 } },
            }}
          >
            <DialogTitle fontWeight={800} sx={{ pt: { xs: 2.5, sm: 2 } }}>
              {editingItem ? "Edit Room Type" : "Add Room Type"}
            </DialogTitle>
            <DialogContent dividers sx={{ px: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <TextField
                  label="Room Type Name"
                  value={formData.name}
                  fullWidth
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label={`Base Price (${hotel?.currency})`}
                    type="number"
                    placeholder="0.00"
                    value={formData.basePrice}
                    fullWidth
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {hotel?.currency}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Capacity (persons)"
                    type="number"
                    placeholder="1"
                    value={formData.capacity}
                    fullWidth
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon sx={{ fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
                <TextField
                  label="Amenities (comma-separated)"
                  placeholder="WiFi, TV, Air Conditioning"
                  value={formData.featuresInput}
                  fullWidth
                  onChange={(e) =>
                    setFormData({ ...formData, featuresInput: e.target.value })
                  }
                  helperText="Separate each amenity with a comma"
                />
                <TextField
                  label="Description"
                  value={formData.description}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe this room type in detail…"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions
              sx={{
                p: 2,
                px: { xs: 2.5, sm: 3 },
                gap: 1,
                flexDirection: { xs: "column-reverse", sm: "row" },
              }}
            >
              <Button
                onClick={() => setOpenDialog(false)}
                color="inherit"
                fullWidth={isMobile}
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={submitLoading}
                fullWidth={isMobile}
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 90 }}
              >
                {submitLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : editingItem ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogActions>
          </Dialog>

          {/* ── Delete confirm dialog ── */}
          <Dialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
          >
            <DialogTitle
              sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WarningIcon
                  sx={{ color: theme.palette.error.main, fontSize: 22 }}
                />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  lineHeight={1.2}
                >
                  Delete Room Type
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This action cannot be undone
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.7}
              >
                Are you sure you want to permanently delete this room type? All
                associated rooms may be affected.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
              <Button
                onClick={() => setDeleteConfirmOpen(false)}
                color="inherit"
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                color="error"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 90 }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

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
          sx={{ borderRadius: 2, width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomTypesPage;
