import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
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
  Tooltip,
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
  AttachMoney as PriceIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { roomService } from "../../services/roomService";
import { roomTypeService } from "../../services/roomTypeService";

const API_BASE_URL = "http://localhost:5000";

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

const RoomsPage = () => {
  const theme = useTheme();
  const role = (localStorage.getItem("role") || "").toUpperCase();

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
    } catch (error) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return "success";
      case RoomStatus.OCCUPIED:
        return "error";
      case RoomStatus.MAINTENANCE:
        return "warning";
      case RoomStatus.DIRTY:
        return "secondary";
      default:
        return "default";
    }
  };

  const getRoomTypeData = (room: IRoom): IRoomType | undefined => {
    if (typeof room.roomType === "object" && room.roomType !== null)
      return room.roomType as IRoomType;
    return roomTypes.find((t) => t._id === room.roomType);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} mb={0.5}>
            Room Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
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
              fontSize: "1rem",
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
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
        }}
      >
        {rooms.map((room) => {
          const typeData = getRoomTypeData(room);
          const imageUrl = getFullImageUrl(room.image);
          const isOccupied = room.status === RoomStatus.OCCUPIED;

          return (
            <Card
              key={room._id}
              elevation={3}
              sx={{
                width: "250px",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 8 },
                opacity: isHousekeeping && isOccupied ? 0.82 : 1,
              }}
            >
              <Box sx={{ position: "relative" }}>
                {imageUrl ? (
                  <CardMedia
                    component="img"
                    sx={{ height: 180, objectFit: "cover" }}
                    image={imageUrl}
                    alt={`Room ${room.roomNumber}`}
                    onError={(e: any) => {
                      e.target.src =
                        "https://via.placeholder.com/250x180?text=Error";
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: "grey.100",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <NoImageIcon
                      sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                    >
                      No Image
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {isHousekeeping && isOccupied && (
                    <Tooltip title="Occupied — no changes allowed">
                      <Box
                        sx={{
                          bgcolor: "rgba(0,0,0,0.52)",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <LockIcon sx={{ fontSize: 15, color: "#fff" }} />
                      </Box>
                    </Tooltip>
                  )}
                  <Chip
                    label={room.status}
                    color={getStatusColor(room.status) as any}
                    sx={{ fontWeight: "bold", backdropFilter: "blur(4px)" }}
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
                    p: 2,
                    pt: 4,
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {room.roomNumber}
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {!isHousekeeping && (
                  <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={1}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="primary"
                        >
                          {typeData?.name || "Unknown Type"}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          sx={{ mt: 0.5 }}
                        >
                          <FloorIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Floor {room.floor}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" fontWeight="bold">
                          ${typeData?.basePrice || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          / night
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        height: 40,
                      }}
                    >
                      {typeData?.description ||
                        "No description available for this room type."}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      sx={{ gap: 1 }}
                    >
                      {typeData?.features?.slice(0, 2).map((feature, idx) => (
                        <Chip
                          key={idx}
                          icon={
                            <FeatureIcon sx={{ fontSize: "14px !important" }} />
                          }
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1, fontSize: "0.7rem" }}
                        />
                      ))}
                      {(typeData?.features?.length || 0) > 2 && (
                        <Chip
                          label={`+${(typeData?.features?.length || 0) - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </>
                )}

                {isHousekeeping && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 0.5 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <FloorIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Floor {room.floor}
                      </Typography>
                    </Stack>
                    {isOccupied && (
                      <Chip
                        size="small"
                        icon={<LockIcon sx={{ fontSize: "12px !important" }} />}
                        label="Locked"
                        sx={{
                          fontSize: "0.62rem",
                          height: 20,
                          bgcolor: theme.palette.error.main + "14",
                          color: theme.palette.error.main,
                          border: `1px solid ${theme.palette.error.main}28`,
                          "& .MuiChip-icon": {
                            color: theme.palette.error.main,
                          },
                        }}
                      />
                    )}
                  </Stack>
                )}
              </CardContent>

              <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
                {isHousekeeping &&
                  (isOccupied ? (
                    <Box
                      sx={{
                        width: "100%",
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.error.main + "10",
                        border: `1px solid ${theme.palette.error.main}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.8,
                      }}
                    >
                      <LockIcon
                        sx={{ fontSize: 14, color: theme.palette.error.main }}
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
                        startIcon={
                          statusLoadingId ===
                          room._id + RoomStatus.AVAILABLE ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <AvailableIcon />
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
                          fontSize: "0.75rem",
                        }}
                      >
                        Available
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        color="warning"
                        startIcon={
                          statusLoadingId === room._id + RoomStatus.DIRTY ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <DirtyIcon />
                          )
                        }
                        disabled={
                          room.status === RoomStatus.DIRTY || !!statusLoadingId
                        }
                        onClick={() =>
                          handleStatusChange(room, RoomStatus.DIRTY)
                        }
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: "0.75rem",
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
                    startIcon={<ViewIcon />}
                    onClick={() => setViewRoom(room)}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    View Full Info
                  </Button>
                )}

                {isAdminOrManager && (
                  <>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => handleOpen(room)}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteClick(room._id)}
                      sx={{ borderRadius: 2, minWidth: 50, px: 0 }}
                    >
                      <DeleteIcon />
                    </Button>
                  </>
                )}
              </Box>
            </Card>
          );
        })}
      </Box>

      {isReceptionist &&
        viewRoom &&
        (() => {
          const typeData = getRoomTypeData(viewRoom);
          const imageUrl = getFullImageUrl(viewRoom.image);
          return (
            <Dialog
              open
              onClose={() => setViewRoom(null)}
              maxWidth="sm"
              fullWidth
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
                    color={getStatusColor(viewRoom.status) as any}
                    sx={{ fontWeight: "bold" }}
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
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PriceIcon fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={700}>
                          ${typeData?.price || 0}
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {" "}
                            / night
                          </Typography>
                        </Typography>
                      </Stack>
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
                      bgcolor: theme.palette.info.main + "0f",
                      border: `1px solid ${theme.palette.info.main}28`,
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
          >
            <DialogTitle>
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
                    border: "1px dashed grey",
                    p: 2,
                    borderRadius: 1,
                    textAlign: "center",
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
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <CircularProgress size={24} />
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
          >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningIcon color="error" /> Confirm Delete
            </DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this room? This action cannot be
                undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
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
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomsPage;
