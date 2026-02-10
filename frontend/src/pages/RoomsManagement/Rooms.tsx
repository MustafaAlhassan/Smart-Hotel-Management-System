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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { roomService } from "../../services/roomService";
import { roomTypeService } from "../../services/roomTypeService";
import { RoomStatus } from "../../types/types";
import type { IRoom, IRoomType } from "../../types/types";
const RoomsPage = () => {
  // CRITICAL: Initialize as empty array to prevent .map() white screen crash
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    floor: 0,
    status: RoomStatus.AVAILABLE,
    image: "",
  });

  const fetchData = async () => {
    try {
      const [roomsData, typesData] = await Promise.all([
        roomService.getAllRooms(),
        roomTypeService.getAllRoomTypes(),
      ]);
      // Ensure we always set an array even if the backend fails
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setRoomTypes(Array.isArray(typesData) ? typesData : []);
    } catch (error) {
      console.error("Fetch Error:", error);
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (room?: IRoom) => {
    if (room) {
      setEditingRoom(room);
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
      setFormData({
        roomNumber: "",
        roomType: "",
        floor: 0,
        status: RoomStatus.AVAILABLE,
        image: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, formData);
      } else {
        await roomService.createRoom(formData);
      }
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this room?")) {
      await roomService.deleteRoom(id);
      fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Occupied":
        return "error";
      case "Maintenance":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
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

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room._id}>
            <Card sx={{ borderRadius: 4, bgcolor: "#1a2232", color: "white" }}>
              <CardMedia
                component="img"
                height="180"
                image={room.image || "https://via.placeholder.com/300"}
              />
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="h6">Room {room.roomNumber}</Typography>
                  <Chip
                    label={room.status}
                    color={getStatusColor(room.status) as any}
                    size="small"
                  />
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Floor: {room.floor}
                </Typography>
                <Typography
                  variant="body2"
                  color="primary.light"
                  sx={{ mt: 1 }}
                >
                  {typeof room.roomType === "object"
                    ? room.roomType?.name
                    : "Standard Room"}
                </Typography>
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <IconButton color="primary" onClick={() => handleOpen(room)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(room._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{editingRoom ? "Edit Room" : "Add Room"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Room Number"
              value={formData.roomNumber}
              fullWidth
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
            />
            <TextField
              select
              label="Room Type"
              value={formData.roomType}
              fullWidth
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
              onChange={(e) =>
                setFormData({ ...formData, floor: Number(e.target.value) })
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
            <TextField
              label="Image URL"
              value={formData.image}
              fullWidth
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Room
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoomsPage;
