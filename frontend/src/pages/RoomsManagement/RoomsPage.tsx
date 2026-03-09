import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  alpha,
  Pagination,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  ImageNotSupported as NoImageIcon,
  CheckCircle as FeatureIcon,
  Stairs as FloorIcon,
  Warning as WarningIcon,
  CleaningServices as DirtyIcon,
  CheckCircleOutline as AvailableIcon,
  Lock as LockIcon,
  Visibility as ViewIcon,
  Hotel as HotelIcon,
  Info as InfoIcon,
  Bed as BedIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { roomService } from "../../services/roomService";
import { roomTypeService } from "../../services/roomTypeService";
import { useHotel } from "../../context/HotelContext";

const API_BASE_URL = "http://localhost:5000";
const PAGE_SIZE = 10;

export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  DIRTY = "Dirty",
  MAINTENANCE = "Maintenance",
}

export interface IRoomType {
  _id: string;
  name: string;
  price: number;
  basePrice?: number;
  description?: string;
  features?: string[];
}

export interface IRoom {
  _id: string;
  roomNumber: string;
  roomType: string | IRoomType;
  floor: number;
  status: RoomStatus;
  image?: string;
}

const statusConfig: Record<
  string,
  { color: string; bg: string; border: string; chipColor: any }
> = {
  [RoomStatus.AVAILABLE]: {
    color: "#16a34a",
    bg: "rgba(22,163,74,0.10)",
    border: "rgba(22,163,74,0.25)",
    chipColor: "success",
  },
  [RoomStatus.OCCUPIED]: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.10)",
    border: "rgba(220,38,38,0.25)",
    chipColor: "error",
  },
  [RoomStatus.DIRTY]: {
    color: "#9333ea",
    bg: "rgba(147,51,234,0.10)",
    border: "rgba(147,51,234,0.25)",
    chipColor: "secondary",
  },
  [RoomStatus.MAINTENANCE]: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.10)",
    border: "rgba(217,119,6,0.25)",
    chipColor: "warning",
  },
};
const RoomsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const { hotel } = useHotel();

  const isHousekeeping = role === "HOUSEKEEPING";
  const isReceptionist = role === "RECEPTIONIST";
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [open, setOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewRoom, setViewRoom] = useState<IRoom | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    floor: "" as string | number,
    status: RoomStatus.AVAILABLE,
    image: "",
  });

  const getFullImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http") || imagePath.startsWith("blob:"))
      return imagePath;
    return `${API_BASE_URL}/${imagePath}`;
  };

  const fetchData = async () => {
    try {
      const [roomsData, typesResponse] = await Promise.all([
        roomService.getAllRooms(),
        isHousekeeping
          ? Promise.resolve([])
          : roomTypeService.getAllRoomTypes(),
      ]);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      if (!isHousekeeping) {
        if (Array.isArray(typesResponse)) {
          setRoomTypes(typesResponse);
        } else if (
          typesResponse &&
          Array.isArray((typesResponse as any).data)
        ) {
          setRoomTypes((typesResponse as any).data);
        }
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to load data",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRoomTypeData = (room: IRoom): IRoomType | undefined => {
    if (typeof room.roomType === "object" && room.roomType !== null)
      return room.roomType as IRoomType;
    return roomTypes.find((t) => t._id === room.roomType);
  };

  const allFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort(
    (a, b) => a - b,
  );

  const filtered = rooms.filter((room) => {
    const typeData = getRoomTypeData(room);
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      room.roomNumber.toLowerCase().includes(q) ||
      (typeData?.name || "").toLowerCase().includes(q) ||
      String(room.floor).includes(q);
    const matchStatus = !statusFilter || room.status === statusFilter;
    const matchType =
      !roomTypeFilter ||
      (typeof room.roomType === "string"
        ? room.roomType === roomTypeFilter
        : (room.roomType as IRoomType)?._id === roomTypeFilter);
    const matchFloor = !floorFilter || String(room.floor) === floorFilter;
    return matchSearch && matchStatus && matchType && matchFloor;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters =
    !!searchQuery || !!statusFilter || !!roomTypeFilter || !!floorFilter;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setRoomTypeFilter("");
    setFloorFilter("");
    setPage(1);
  };

  const surface = isDark ? alpha("#fff", 0.03) : "#fff";
  const border = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.07);

  const handleStatusChange = async (room: IRoom, newStatus: RoomStatus) => {
    setStatusLoadingId(room._id + newStatus);
    try {
      await roomService.updateRoomStatus(room._id, newStatus);
      setSnackbar({
        open: true,
        message: `Room ${room.roomNumber} marked as ${newStatus}`,
        severity: "success",
      });
      fetchData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to update status",
        severity: "error",
      });
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.image.startsWith("blob:"))
        URL.revokeObjectURL(formData.image);
      setSelectedFile(file);
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  const handleOpen = (room?: IRoom) => {
    if (room) {
      setEditingRoom(room);
      setSelectedFile(null);
      setFormData({
        roomNumber: room.roomNumber,
        roomType:
          typeof room.roomType === "string"
            ? room.roomType
            : room.roomType?._id || "",
        floor: room.floor,
        status: room.status,
        image: room.image || "",
      });
    } else {
      setEditingRoom(null);
      setSelectedFile(null);
      setFormData({
        roomNumber: "",
        roomType: "",
        floor: "",
        status: RoomStatus.AVAILABLE,
        image: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.roomNumber || !formData.roomType || formData.floor === "") {
      setSnackbar({
        open: true,
        message: "Please fill required fields",
        severity: "error",
      });
      return;
    }
    try {
      setSaveLoading(true);
      const data = new FormData();
      data.append("roomNumber", formData.roomNumber);
      data.append("roomType", formData.roomType);
      data.append("floor", formData.floor.toString());
      data.append("status", formData.status);
      if (selectedFile) data.append("image", selectedFile);
      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, data);
      } else {
        await roomService.createRoom(data);
      }
      setSnackbar({
        open: true,
        message: editingRoom ? "Room updated!" : "Room created!",
        severity: "success",
      });
      setOpen(false);
      fetchData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.status === 413
            ? "Image too large"
            : "Failed to save room",
        severity: "error",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setRoomToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      await roomService.deleteRoom(roomToDelete);
      setSnackbar({
        open: true,
        message: "Room deleted successfully",
        severity: "success",
      });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally {
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 8, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 5,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            letterSpacing={-0.5}
            mb={0.5}
            sx={{ textAlign: "left" }}
          >
            Rooms Management
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "left" }}
          >
            {isHousekeeping
              ? "View rooms and update their cleaning status."
              : isReceptionist
                ? "View full room details. Contact management for any changes."
                : "Manage your hotel inventory, prices, and status."}
          </Typography>
        </Box>
        {isAdminOrManager && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            size="large"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 700,
              boxShadow: 4,
              width: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
            }}
          >
            Add New Room
          </Button>
        )}
      </Box>

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
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <TextField
              placeholder="Search room number, type, floor…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              size="small"
              fullWidth={isMobile}
              sx={{ flex: "2 1 200px" }}
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
              sx={{ flex: "1 1 140px" }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                sx={{ borderRadius: 2, bgcolor: surface }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.values(RoomStatus).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!isHousekeeping && (
              <FormControl
                size="small"
                fullWidth={isMobile}
                sx={{ flex: "1 1 150px" }}
              >
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={roomTypeFilter}
                  label="Room Type"
                  onChange={(e) => {
                    setRoomTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2, bgcolor: surface }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {roomTypes.map((t) => (
                    <MenuItem key={t._id} value={t._id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl
              size="small"
              fullWidth={isMobile}
              sx={{ flex: "1 1 120px" }}
            >
              <InputLabel>Floor</InputLabel>
              <Select
                value={floorFilter}
                label="Floor"
                onChange={(e) => {
                  setFloorFilter(e.target.value);
                  setPage(1);
                }}
                sx={{ borderRadius: 2, bgcolor: surface }}
              >
                <MenuItem value="">All Floors</MenuItem>
                {allFloors.map((f) => (
                  <MenuItem key={f} value={String(f)}>
                    Floor {f}
                  </MenuItem>
                ))}
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
                  alignSelf: "center",
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Collapse>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filtered.length} {filtered.length === 1 ? "room" : "rooms"} found
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
          <BedIcon sx={{ fontSize: 52, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            No rooms found
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={0.5}>
            {hasFilters
              ? "Try adjusting your filters"
              : "Add your first room to get started"}
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
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {paginated.map((room) => {
              const typeData = getRoomTypeData(room);
              const imageUrl = getFullImageUrl(room.image);
              const isOccupied = room.status === RoomStatus.OCCUPIED;
              const sc =
                statusConfig[room.status] || statusConfig[RoomStatus.AVAILABLE];

              return (
                <Box
                  key={room._id}
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                    bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                    boxShadow: isDark
                      ? "0 4px 24px rgba(0,0,0,0.4)"
                      : "0 2px 16px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark
                        ? "0 12px 40px rgba(0,0,0,0.6)"
                        : "0 8px 32px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    {imageUrl ? (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={`Room ${room.roomNumber}`}
                        onError={(e: any) => {
                          e.target.src =
                            "https://via.placeholder.com/400x220?text=No+Image";
                        }}
                        sx={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          background: isDark
                            ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                            : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <BedIcon
                          sx={{
                            fontSize: 52,
                            color: isDark
                              ? "rgba(255,255,255,0.15)"
                              : "rgba(0,0,0,0.12)",
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          fontWeight={600}
                          letterSpacing={1}
                        >
                          NO IMAGE
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)",
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        right: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {isHousekeeping && isOccupied && (
                        <Tooltip title="Occupied — no changes allowed">
                          <Box
                            sx={{
                              bgcolor: "rgba(0,0,0,0.55)",
                              backdropFilter: "blur(6px)",
                              borderRadius: "50%",
                              width: 30,
                              height: 30,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <LockIcon sx={{ fontSize: 14, color: "#fff" }} />
                          </Box>
                        </Tooltip>
                      )}
                      <Box sx={{ ml: "auto" }}>
                        <Chip
                          label={room.status}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            letterSpacing: "0.04em",
                            bgcolor: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                            backdropFilter: "blur(8px)",
                            height: 24,
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: "12px 14px 10px",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        color="#fff"
                        letterSpacing={-0.5}
                        lineHeight={1}
                      >
                        {room.roomNumber}
                      </Typography>
                      {!isHousekeeping && typeData?.name && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.72)",
                            fontWeight: 500,
                          }}
                        >
                          {typeData.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    {!isHousekeeping && (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                          >
                            <FloorIcon
                              sx={{ fontSize: 15, color: "text.secondary" }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Floor {room.floor}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="baseline"
                            spacing={0.3}
                          >
                            <Typography
                              variant="body1"
                              fontWeight={800}
                              color="primary.main"
                            >
                              {hotel?.currency}
                              {typeData?.basePrice ?? typeData?.price ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              / night
                            </Typography>
                          </Stack>
                        </Box>

                        {typeData?.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.6,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              minHeight: "3.2em",
                            }}
                          >
                            {typeData.description}
                          </Typography>
                        )}

                        {typeData?.features && typeData.features.length > 0 && (
                          <Stack
                            direction="row"
                            flexWrap="wrap"
                            gap={0.7}
                            sx={{ mt: 0.5 }}
                          >
                            {typeData.features
                              .slice(0, 3)
                              .map((feature, idx) => (
                                <Chip
                                  key={idx}
                                  label={feature}
                                  size="small"
                                  icon={
                                    <FeatureIcon
                                      sx={{ fontSize: "11px !important" }}
                                    />
                                  }
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1.5,
                                    fontSize: "0.65rem",
                                    height: 22,
                                    fontWeight: 600,
                                    color: "text.secondary",
                                    borderColor: isDark
                                      ? "rgba(255,255,255,0.12)"
                                      : "rgba(0,0,0,0.12)",
                                  }}
                                />
                              ))}
                            {(typeData.features.length || 0) > 3 && (
                              <Chip
                                label={`+${typeData.features.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderRadius: 1.5,
                                  fontSize: "0.65rem",
                                  height: 22,
                                  fontWeight: 600,
                                  color: "text.secondary",
                                  borderColor: isDark
                                    ? "rgba(255,255,255,0.12)"
                                    : "rgba(0,0,0,0.12)",
                                }}
                              />
                            )}
                          </Stack>
                        )}
                      </>
                    )}

                    {isHousekeeping && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <FloorIcon
                            sx={{ fontSize: 15, color: "text.secondary" }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={500}
                          >
                            Floor {room.floor}
                          </Typography>
                        </Stack>
                        {isOccupied && (
                          <Chip
                            size="small"
                            icon={
                              <LockIcon sx={{ fontSize: "11px !important" }} />
                            }
                            label="Locked"
                            sx={{
                              fontSize: "0.62rem",
                              height: 20,
                              fontWeight: 700,
                              bgcolor: alpha(theme.palette.error.main, 0.08),
                              color: theme.palette.error.main,
                              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                              "& .MuiChip-icon": {
                                color: theme.palette.error.main,
                              },
                            }}
                          />
                        )}
                      </Box>
                    )}

                    <Divider sx={{ mt: "auto", mb: 0.5, opacity: 0.5 }} />

                    <Box sx={{ display: "flex", gap: 1 }}>
                      {isHousekeeping &&
                        (isOccupied ? (
                          <Box
                            sx={{
                              width: "100%",
                              py: 0.9,
                              px: 1.5,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.error.main, 0.06),
                              border: `1px solid ${alpha(theme.palette.error.main, 0.16)}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.7,
                            }}
                          >
                            <LockIcon
                              sx={{
                                fontSize: 13,
                                color: theme.palette.error.main,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="error"
                              fontWeight={600}
                            >
                              Occupied — no changes allowed
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            <Button
                              variant="contained"
                              fullWidth
                              color="success"
                              size="small"
                              startIcon={
                                statusLoadingId ===
                                room._id + RoomStatus.AVAILABLE ? (
                                  <CircularProgress size={13} color="inherit" />
                                ) : (
                                  <AvailableIcon
                                    sx={{ fontSize: "16px !important" }}
                                  />
                                )
                              }
                              disabled={
                                room.status === RoomStatus.AVAILABLE ||
                                !!statusLoadingId
                              }
                              onClick={() =>
                                handleStatusChange(room, RoomStatus.AVAILABLE)
                              }
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                              }}
                            >
                              Available
                            </Button>
                            <Button
                              variant="outlined"
                              fullWidth
                              color="warning"
                              size="small"
                              startIcon={
                                statusLoadingId ===
                                room._id + RoomStatus.DIRTY ? (
                                  <CircularProgress size={13} color="inherit" />
                                ) : (
                                  <DirtyIcon
                                    sx={{ fontSize: "16px !important" }}
                                  />
                                )
                              }
                              disabled={
                                room.status === RoomStatus.DIRTY ||
                                !!statusLoadingId
                              }
                              onClick={() =>
                                handleStatusChange(room, RoomStatus.DIRTY)
                              }
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                              }}
                            >
                              Dirty
                            </Button>
                          </>
                        ))}

                      {isReceptionist && (
                        <Button
                          variant="outlined"
                          fullWidth
                          size="small"
                          startIcon={
                            <ViewIcon sx={{ fontSize: "16px !important" }} />
                          }
                          onClick={() => setViewRoom(room)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                          }}
                        >
                          View Full Info
                        </Button>
                      )}

                      {isAdminOrManager && (
                        <>
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            startIcon={
                              <EditIcon sx={{ fontSize: "16px !important" }} />
                            }
                            onClick={() => handleOpen(room)}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.78rem",
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(room._id)}
                            sx={{ borderRadius: 2, minWidth: 40, px: 0 }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
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

      {isReceptionist &&
        viewRoom &&
        (() => {
          const typeData = getRoomTypeData(viewRoom);
          const imageUrl = getFullImageUrl(viewRoom.image);
          const sc =
            statusConfig[viewRoom.status] || statusConfig[RoomStatus.AVAILABLE];
          return (
            <Dialog
              open
              onClose={() => setViewRoom(null)}
              maxWidth="sm"
              fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}
            >
              <DialogTitle sx={{ pb: 0.5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <HotelIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Room {viewRoom.roomNumber}
                    </Typography>
                  </Stack>
                  <Chip
                    label={viewRoom.status}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                    }}
                  />
                </Stack>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 0 }}>
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={`Room ${viewRoom.roomNumber}`}
                    sx={{
                      width: "100%",
                      height: 240,
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 140,
                      bgcolor: "grey.100",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <NoImageIcon
                      sx={{ fontSize: 48, color: "text.disabled" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      No Image Available
                    </Typography>
                  </Box>
                )}
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={4} mb={2} flexWrap="wrap">
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Room Type
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color="primary"
                      >
                        {typeData?.name || "—"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Floor
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FloorIcon fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={600}>
                          Floor {viewRoom.floor}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Price
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {hotel?.currency}
                        {typeData?.basePrice ?? typeData?.price ?? 0}
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
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  {typeData?.description && (
                    <Box mb={2}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Description
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        lineHeight={1.7}
                      >
                        {typeData.description}
                      </Typography>
                    </Box>
                  )}
                  {typeData?.features && typeData.features.length > 0 && (
                    <Box mb={2}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Features
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {typeData.features.map((feature, idx) => (
                          <Chip
                            key={idx}
                            icon={
                              <FeatureIcon
                                sx={{ fontSize: "14px !important" }}
                              />
                            }
                            label={feature}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ borderRadius: 1 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
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
                    <InfoIcon sx={{ fontSize: 16, color: "info.main" }} />
                    <Typography
                      variant="caption"
                      color="info.main"
                      fontWeight={500}
                    >
                      View only — contact management for any room modifications.
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" onClick={() => setViewRoom(null)}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          );
        })()}

      {isAdminOrManager && (
        <>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle fontWeight={800}>
              {editingRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Room Number"
                  value={formData.roomNumber}
                  fullWidth
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                />
                <TextField
                  select
                  label="Room Type"
                  value={formData.roomType}
                  fullWidth
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, roomType: e.target.value })
                  }
                >
                  {roomTypes.map((t) => (
                    <MenuItem key={t._id} value={t._id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Floor"
                  type="number"
                  value={formData.floor}
                  fullWidth
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
                  }
                />
                <TextField
                  select
                  label="Status"
                  value={formData.status}
                  fullWidth
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as RoomStatus,
                    })
                  }
                >
                  {Object.values(RoomStatus).map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
                <Box
                  sx={{
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    size="small"
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {formData.image && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={getFullImageUrl(formData.image)}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: 150,
                          objectFit: "contain",
                          borderRadius: 4,
                        }}
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setFormData({ ...formData, image: "" });
                          setSelectedFile(null);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, px: 3 }}>
              <Button
                onClick={() => setOpen(false)}
                color="inherit"
                sx={{ fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saveLoading}
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 90 }}
              >
                {saveLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : editingRoom ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle
              sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
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
                  Delete Room
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
                Are you sure you want to permanently delete this room? All
                associated data will be removed and cannot be recovered.
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
                onClick={handleConfirmDelete}
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
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomsPage;
