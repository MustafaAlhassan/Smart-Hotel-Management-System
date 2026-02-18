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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  ImageNotSupported as NoImageIcon,
  CheckCircle as FeatureIcon,
  Stairs as FloorIcon,
  Warning as WarningIcon, // Added for the delete dialog
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
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [open, setOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- NEW STATE FOR DELETE CONFIRMATION ---
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
    if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) {
      return imagePath;
    }
    return `${API_BASE_URL}/${imagePath}`;
  };

  const fetchData = async () => {
    try {
      const [roomsData, typesResponse] = await Promise.all([
        roomService.getAllRooms(),
        roomTypeService.getAllRoomTypes(),
      ]);

      setRooms(Array.isArray(roomsData) ? roomsData : []);

      if (Array.isArray(typesResponse)) {
        setRoomTypes(typesResponse);
      } else if (typesResponse && Array.isArray((typesResponse as any).data)) {
        setRoomTypes((typesResponse as any).data);
      } else {
        setRoomTypes([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.image.startsWith("blob:")) {
        URL.revokeObjectURL(formData.image);
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: previewUrl });
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

      if (selectedFile) {
        data.append("image", selectedFile);
      }

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
      const msg =
        error.response?.status === 413
          ? "Image too large"
          : "Failed to save room";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  // --- STEP 1: OPEN THE CONFIRMATION DIALOG ---
  const handleDeleteClick = (id: string) => {
    setRoomToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // --- STEP 2: EXECUTE DELETE (Called by Dialog) ---
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
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Delete failed",
        severity: "error",
      });
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
    if (typeof room.roomType === "object" && room.roomType !== null) {
      return room.roomType as IRoomType;
    }
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
          <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>
            Room Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your hotel inventory, prices, and status.
          </Typography>
        </Box>
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
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        {rooms.map((room) => {
          const typeData = getRoomTypeData(room);
          const imageUrl = getFullImageUrl(room.image);

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
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 8,
                },
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
                  }}
                >
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
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      ${typeData?.basePrice || 0}
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
              </CardContent>

              <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
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
                  // Updated: Now calls handleDeleteClick instead of direct delete
                  onClick={() => handleDeleteClick(room._id)}
                  sx={{ borderRadius: 2, minWidth: 50, px: 0 }}
                >
                  <DeleteIcon />
                </Button>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* EDIT / CREATE DIALOG */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
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

      {/* NEW DELETE CONFIRMATION DIALOG */}
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
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomsPage;
