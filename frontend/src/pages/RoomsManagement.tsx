import React, { useState, ChangeEvent } from "react";
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

interface Room {
  id: number;
  number: string;
  type: string;
  price: number;
  capacity: number;
  services: string;
  image: string;
  status: "Available" | "Occupied" | "Maintenance";
}

const RoomsManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      number: "101",
      type: "Luxury Suite",
      price: 250,
      capacity: 2,
      services: "Free WiFi, Mini Bar, Sea View",
      image:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
      status: "Available",
    },
    {
      id: 2,
      number: "205",
      type: "Double Room",
      price: 150,
      capacity: 4,
      services: "Pool Access, Breakfast",
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      status: "Occupied",
    },
    {
      id: 2,
      number: "205",
      type: "Double Room",
      price: 150,
      capacity: 4,
      services: "Pool Access, Breakfast",
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      status: "Occupied",
    },
    {
      id: 2,
      number: "205",
      type: "Double Room",
      price: 150,
      capacity: 4,
      services: "Pool Access, Breakfast",
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      status: "Occupied",
    },
    {
      id: 2,
      number: "205",
      type: "Double Room",
      price: 150,
      capacity: 4,
      services: "Pool Access, Breakfast",
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      status: "Occupied",
    },
    {
      id: 2,
      number: "205",
      type: "Double Room",
      price: 150,
      capacity: 4,
      services: "Pool Access, Breakfast",
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      status: "Occupied",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setSelectedRoom(null);
    setPreviewImage(null);
    setEditMode(false);
    setOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setPreviewImage(room.image);
    setEditMode(true);
    setOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: "1600px", margin: "0 auto" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "#f8fafc",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: { xs: "1.5rem", md: "2.2rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Rooms Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 8px 20px rgba(25, 118, 210, 0.3)",
          }}
        >
          Add New Room
        </Button>
      </Paper>

      {/* Modern Grid Layout */}
      <Grid container spacing={4}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} lg={4} key={room.id}>
            <Card
              sx={{
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="260"
                  image={room.image}
                  alt={room.number}
                />
                <Chip
                  label={room.status}
                  color={room.status === "Available" ? "success" : "error"}
                  sx={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    fontWeight: "bold",
                    backdropFilter: "blur(10px)",
                  }}
                />
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h5" fontWeight="800">
                    Room {room.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    fontWeight="900"
                  >
                    ${room.price}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      /night
                    </Typography>
                  </Typography>
                </Stack>

                <Stack spacing={1.5} mb={3}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    color="text.secondary"
                  >
                    <BedIcon fontSize="small" />{" "}
                    <Typography variant="body2">{room.type}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    color="text.secondary"
                  >
                    <CapacityIcon fontSize="small" />{" "}
                    <Typography variant="body2">
                      Up to {room.capacity} Guests
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    color="text.secondary"
                  >
                    <ServiceIcon fontSize="small" />{" "}
                    <Typography variant="body2" noWrap>
                      {room.services}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEdit(room)}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    Edit
                  </Button>
                  <IconButton
                    color="error"
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "error.light",
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: "1.8rem", pb: 0 }}>
          {editMode ? "Edit Room Details" : "New Room Entry"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please ensure all smart features are correctly listed.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Room Number"
                fullWidth
                variant="filled"
                defaultValue={selectedRoom?.number}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Category"
                fullWidth
                variant="filled"
                defaultValue={selectedRoom?.type || "Single"}
              >
                <MenuItem value="Single">Single Deluxe</MenuItem>
                <MenuItem value="Double">Double Suite</MenuItem>
                <MenuItem value="Suite">Presidential</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                variant="filled"
                defaultValue={selectedRoom?.price}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Capacity"
                type="number"
                fullWidth
                variant="filled"
                defaultValue={selectedRoom?.capacity}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Services"
                fullWidth
                variant="filled"
                placeholder="WiFi, Pool, etc."
                defaultValue={selectedRoom?.services}
              />
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
                  bgcolor: "action.hover",
                }}
              >
                {previewImage ? (
                  <Stack alignItems="center" spacing={2}>
                    <Avatar
                      src={previewImage}
                      sx={{ width: 100, height: 100, borderRadius: 2 }}
                    />
                    <Button size="small" onClick={() => setPreviewImage(null)}>
                      Remove Image
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    Upload Room Image
                    <input type="file" hidden onChange={handleImageChange} />
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button
            onClick={() => setOpen(false)}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            sx={{ px: 6, borderRadius: 3, fontWeight: "bold" }}
          >
            {editMode ? "Update Room" : "Save Entry"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsManagement;
