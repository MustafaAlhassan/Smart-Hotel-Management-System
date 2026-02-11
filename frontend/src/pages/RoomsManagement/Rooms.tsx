import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  ImageNotSupported as NoImageIcon,
} from "@mui/icons-material";
import { roomService } from "../../services/roomService";
import { roomTypeService } from "../../services/roomTypeService";

// --- Types & Enums ---
export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  DIRTY = "Dirty",
  MAINTENANCE = "Maintenance",
}

export interface IRoomType {
  _id: string;
  name: string;
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
  // --- State ---
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // For image processing
  const [saveLoading, setSaveLoading] = useState(false); // For API saving
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);

  // State for the raw file to be sent via FormData
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    image: "", // Used for preview URL only
  });

  // --- Fetch Data ---
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
        message: "Failed to load rooms",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- IMAGE HANDLER (Modified for FormData) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Store the raw file to send it later
      setSelectedFile(file);

      // 2. Create a local preview URL for the UI
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: previewUrl });
    }
  };

  // --- Handlers ---
  const handleOpen = (room?: IRoom) => {
    if (room) {
      setEditingRoom(room);
      setSelectedFile(null); // Reset file on edit open
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

  // --- SAVE HANDLER (Modified to use FormData) ---
  const handleSave = async () => {
    if (!formData.roomNumber || !formData.roomType || formData.floor === "") {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    try {
      setSaveLoading(true);

      // Create FormData object
      const data = new FormData();
      data.append("roomNumber", formData.roomNumber);
      data.append("roomType", formData.roomType);
      data.append("floor", formData.floor.toString());
      data.append("status", formData.status);

      // Only append image if a new file was selected
      if (selectedFile) {
        data.append("image", selectedFile);
      }

      // NOTE: Ensure your roomService accepts FormData as the payload
      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, data);
        setSnackbar({
          open: true,
          message: "Room updated successfully!",
          severity: "success",
        });
      } else {
        await roomService.createRoom(data);
        setSnackbar({
          open: true,
          message: "Room created successfully!",
          severity: "success",
        });
      }
      setOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Save failed", error);
      const msg =
        error.response?.status === 413
          ? "Image too large."
          : error.response?.data?.message || "Failed to save room";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await roomService.deleteRoom(id);
        setSnackbar({
          open: true,
          message: "Room deleted",
          severity: "success",
        });
        fetchData();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to delete room",
          severity: "error",
        });
      }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="white">
          Rooms Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
        >
          Add New Room
        </Button>
      </Box>

      {/* Grid of Rooms */}
      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={room._id}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Card
              sx={{
                width: "230px",
                height: 380,
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                position: "relative",
              }}
            >
              {room.image ? (
                <CardMedia
                  component="img"
                  sx={{ height: 200, objectFit: "cover" }}
                  image={room.image}
                  alt={`Room ${room.roomNumber}`}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NoImageIcon sx={{ fontSize: 50, opacity: 0.3 }} />
                  <Typography variant="caption" sx={{ opacity: 0.5, mt: 1 }}>
                    No Image
                  </Typography>
                </Box>
              )}

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Room {room.roomNumber}
                    </Typography>
                    <Chip
                      label={room.status}
                      color={getStatusColor(room.status) as any}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Stack>

                  <Stack spacing={0.5} sx={{ opacity: 0.8 }}>
                    <Typography variant="body2">Floor: {room.floor}</Typography>
                    <Typography variant="body2" color="primary.light" noWrap>
                      Type:{" "}
                      {typeof room.roomType === "object"
                        ? room.roomType?.name
                        : "Standard"}
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: "rgba(33, 150, 243, 0.1)",
                      color: "#2196f3",
                    }}
                    onClick={() => handleOpen(room)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ bgcolor: "rgba(244, 67, 54, 0.1)", color: "#f44336" }}
                    onClick={() => handleDelete(room._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
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
              placeholder="e.g. G-101"
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
              {roomTypes.length > 0 ? (
                roomTypes.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Room Types Available</MenuItem>
              )}
            </TextField>
            <TextField
              label="Floor"
              type="number"
              placeholder="0"
              value={formData.floor}
              fullWidth
              required
              inputProps={{ min: -5, max: 500 }}
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

            {/* Image Upload Area */}
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
                disabled={loading}
              >
                {loading ? "Processing..." : "Upload Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {/* No loading needed for basic file select, but kept state just in case */}
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{ display: "block", mx: "auto", mt: 2 }}
                />
              )}

              {!loading && formData.image ? (
                <Box sx={{ mt: 2, position: "relative" }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                      borderRadius: 4,
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
                    Remove Image
                  </Button>
                </Box>
              ) : (
                !loading && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, opacity: 0.7 }}
                  >
                    No image selected
                  </Typography>
                )
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || saveLoading}
          >
            {saveLoading
              ? "Saving..."
              : editingRoom
                ? "Update Room"
                : "Create Room"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomsPage;
