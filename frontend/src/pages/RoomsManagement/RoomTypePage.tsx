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
  Chip,
  Stack,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
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
    basePrice: "" as string | number,
    capacity: "" as string | number,
    description: "",
    featuresInput: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  const handleOpenDialog = (item?: IRoomType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        basePrice: item.basePrice,
        capacity: item.capacity,
        description: item.description || "",
        featuresInput: item.amenities.join(", "),
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    try {
      const featuresArray = formData.featuresInput
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const payload = {
        name: formData.name,
        basePrice: Number(formData.basePrice),
        capacity: Number(formData.capacity),
        description: formData.description,
        amenities: featuresArray,
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
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally {
      setDeleteConfirmOpen(false);
      setIdToDelete(null);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}>Loading...</Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Room Types
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          fullWidth={isMobile}
        >
          Add New Type
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isMobile ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price ($)</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Features</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell sx={{ fontWeight: "bold" }}>{type.name}</TableCell>
                  <TableCell>${type.basePrice}</TableCell>
                  <TableCell>{type.capacity} Persons</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {type.amenities.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography noWrap variant="body2">
                      {type.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end">
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack spacing={2}>
          {roomTypes.map((type) => (
            <Card key={type._id} elevation={2}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="h6" component="div">
                    {type.name}
                  </Typography>
                  <Chip
                    icon={<MoneyIcon />}
                    label={`$${type.basePrice}`}
                    color="primary"
                    size="small"
                  />
                </Box>

                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {type.capacity} Persons
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                  sx={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {type.description || "No description provided."}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {type.amenities.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(type)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setIdToDelete(type._id);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { m: 2, width: "100%" },
        }}
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
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
              }}
            >
              <TextField
                label="Base Price"
                type="number"
                placeholder="0.00"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Capacity"
                type="number"
                placeholder="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Features (Separate features with a comma)"
              placeholder="WiFi, TV, Mini Bar"
              value={formData.featuresInput}
              onChange={(e) =>
                setFormData({ ...formData, featuresInput: e.target.value })
              }
              fullWidth
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
          <Typography>
            Are you sure you want to delete this room type? This action cannot
            be undone.
          </Typography>
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomTypesPage;
