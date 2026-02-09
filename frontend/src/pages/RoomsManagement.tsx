import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  People as CapacityIcon,
  CheckCircle as ServiceIcon,
  Hotel as BedIcon,
} from "@mui/icons-material";

// 1. Updated Interface to match backend keys
interface Room {
  _id?: string; // MongoDB usually uses _id
  roomNumber: string;
  floor: string;
  roomType: string;
  status: "Available" | "Occupied" | "Maintenance";
  image?: string; // URL from server
  // Note: price/capacity usually come from the roomType object in advanced setups
  price?: number;
  capacity?: number;
}

const API_URL = "http://localhost:5000/api/rooms/";

const RoomsManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // States for the form
  const [formData, setFormData] = useState({
    roomNumber: "",
    floor: "",
    roomType: "",
    status: "Available",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 2. Fetch Rooms from Backend
  const fetchRooms = async () => {
    try {
      const response = await axios.get(API_URL);
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({
      roomNumber: "",
      floor: "",
      roomType: "",
      status: "Available",
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Store the actual file for the API
      setPreviewImage(URL.createObjectURL(file)); // For UI preview
    }
  };

  // 3. Save / Update Room Logic
  const handleSave = async () => {
    const data = new FormData();
    data.append("roomNumber", formData.roomNumber);
    data.append("floor", formData.floor);
    data.append("roomType", formData.roomType);
    data.append("status", formData.status);
    if (selectedFile) data.append("image", selectedFile);

    try {
      if (editMode && selectedRoom?._id) {
        await axios.put(`${API_URL}${selectedRoom._id}`, data);
      } else {
        await axios.post(API_URL, data);
      }
      fetchRooms(); // Refresh list
      setOpen(false);
    } catch (error) {
      alert("Failed to save room. Check console for details.");
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: "1600px", margin: "0 auto" }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h4" fontWeight="900">
          Rooms Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 3, px: 4 }}
        >
          Add New Room
        </Button>
      </Paper>

      {/* Grid Layout */}
      <Grid container spacing={4}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} lg={4} key={room._id}>
            <Card
              sx={{
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="260"
                  image={
                    room.image
                      ? `http://localhost:5000/${room.image}`
                      : "https://via.placeholder.com/400"
                  }
                />
                <Chip
                  label={room.status}
                  color={room.status === "Available" ? "success" : "error"}
                  sx={{ position: "absolute", top: 20, right: 20 }}
                />
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="800">
                  Room {room.roomNumber}
                </Typography>
                <Typography color="text.secondary">
                  Floor: {room.floor}
                </Typography>
                <Divider sx={{ my: 2, borderStyle: "dashed" }} />
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
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
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editMode ? "Edit Room" : "New Room Entry"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Room Number"
                fullWidth
                variant="filled"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Floor"
                fullWidth
                variant="filled"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Room Type ID"
                fullWidth
                variant="filled"
                value={formData.roomType}
                onChange={(e) =>
                  setFormData({ ...formData, roomType: e.target.value })
                }
              >
                {/* Use the IDs from your friend's database here */}
                <MenuItem value="6946f6ca4939304a397c1d...">
                  Deluxe Suite
                </MenuItem>
                <MenuItem value="other_id">Standard Double</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  p: 3,
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 4,
                  textAlign: "center",
                }}
              >
                {previewImage ? (
                  <Stack alignItems="center" spacing={2}>
                    <Avatar
                      src={previewImage}
                      sx={{ width: 100, height: 100, borderRadius: 2 }}
                    />
                    <Button
                      size="small"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  </Stack>
                ) : (
                  <Button component="label" startIcon={<UploadIcon />}>
                    Upload Room Image
                    <input
                      type="file"
                      hidden
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ px: 6, borderRadius: 3 }}
          >
            {editMode ? "Update Room" : "Save Entry"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsManagement;
