import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Snackbar,
  Chip,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { roomTypeService } from "../../services/roomTypeService";
import type { IRoomType } from "../../types/types";

const RoomTypesPage = () => {
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<IRoomType | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    name: "",
    basePrice: 0,
    capacity: 1,
    description: "",
    amenitiesInput: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await roomTypeService.getAllRoomTypes();

      console.log("API Response:", response);

      if (Array.isArray(response)) {
        setRoomTypes(response);
      } else if (response && Array.isArray((response as any).data)) {
        setRoomTypes((response as any).data);
      } else if (response && Array.isArray((response as any).roomTypes)) {
        setRoomTypes((response as any).roomTypes);
      } else {
        setRoomTypes([]);
        console.error("Data received is not an array!", response);
      }

      setError(null);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to fetch room types");
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (item?: IRoomType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        basePrice: item.basePrice,
        capacity: item.capacity,
        description: item.description || "",
        amenitiesInput: item.amenities.join(", "),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        basePrice: 0,
        capacity: 1,
        description: "",
        amenitiesInput: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      const amenitiesArray = formData.amenitiesInput
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const payload = {
        name: formData.name,
        basePrice: Number(formData.basePrice),
        capacity: Number(formData.capacity),
        description: formData.description,
        amenities: amenitiesArray,
      };

      if (editingItem) {
        await roomTypeService.updateRoomType(editingItem._id, payload);
        setSnackbar({
          open: true,
          message: "Updated successfully",
          severity: "success",
        });
      } else {
        await roomTypeService.createRoomType(payload);
        setSnackbar({
          open: true,
          message: "Created successfully",
          severity: "success",
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Operation failed",
        severity: "error",
      });
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
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setIdToDelete(null);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}>Loading...</Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Room Types
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Type
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price ($)</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Amenities</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(roomTypes) && roomTypes.length > 0 ? (
              roomTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell sx={{ fontWeight: "bold" }}>{type.name}</TableCell>
                  <TableCell>${type.basePrice}</TableCell>
                  <TableCell>{type.capacity} Persons</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {Array.isArray(type.amenities) &&
                        type.amenities.map((am, index) => (
                          <Chip
                            key={index}
                            label={am}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                    </Stack>
                  </TableCell>
                  <TableCell>{type.description || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(type)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setIdToDelete(type._id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? "Loading..." : "No room types found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingItem ? "Edit Room Type" : "Add Room Type"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Room Type Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Base Price"
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basePrice: Number(e.target.value),
                  })
                }
                fullWidth
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: Number(e.target.value) })
                }
                fullWidth
                required
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Box>
            <TextField
              label="Amenities (Separated by comma)"
              placeholder="Wifi, AC, TV, Balcony"
              value={formData.amenitiesInput}
              onChange={(e) =>
                setFormData({ ...formData, amenitiesInput: e.target.value })
              }
              fullWidth
              helperText="Example: WiFi, TV, Mini Bar"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this room type?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomTypesPage;
