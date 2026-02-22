import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalDining,
  LocalLaundryService,
  Spa,
  DirectionsCar,
  MiscellaneousServices,
} from "@mui/icons-material";
import api from "../services/api";

export enum ServiceCategory {
  FOOD_BEVERAGE = "Food & Beverage",
  LAUNDRY = "Laundry",
  SPA = "Spa & Wellness",
  TRANSPORTATION = "Transportation",
  OTHER = "Other",
}

interface IService {
  _id: string;
  name: string;
  price: number;
  isTaxable: boolean;
  category: ServiceCategory;
  description?: string;
}

const initialFormState = {
  name: "",
  price: "",
  isTaxable: false,
  category: ServiceCategory.OTHER,
  description: "",
};

const ServicesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentService, setCurrentService] = useState<IService | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/services");
      setServices(response.data.data);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to fetch services",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case ServiceCategory.FOOD_BEVERAGE:
        return <LocalDining fontSize="small" />;
      case ServiceCategory.LAUNDRY:
        return <LocalLaundryService fontSize="small" />;
      case ServiceCategory.SPA:
        return <Spa fontSize="small" />;
      case ServiceCategory.TRANSPORTATION:
        return <DirectionsCar fontSize="small" />;
      default:
        return <MiscellaneousServices fontSize="small" />;
    }
  };

  const handleOpenAddNew = () => {
    setFormData(initialFormState);
    setCurrentService(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (service: IService) => {
    setFormData({
      name: service.name,
      price: service.price.toString(),
      isTaxable: service.isTaxable,
      category: service.category,
      description: service.description || "",
    });
    setCurrentService(service);
    setOpenForm(true);
  };

  const handleOpenDelete = (service: IService) => {
    setCurrentService(service);
    setOpenDelete(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData, price: Number(formData.price) };

      if (currentService) {
        await api.put(`/services/${currentService._id}`, payload);
        showSnackbar("Service updated successfully", "success");
      } else {
        await api.post("/services", payload);
        showSnackbar("Service added successfully", "success");
      }
      setOpenForm(false);
      fetchServices();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to save service",
        "error",
      );
    }
  };

  const handleDelete = async () => {
    if (!currentService) return;
    try {
      await api.delete(`/services/${currentService._id}`);
      showSnackbar("Service deleted successfully", "success");
      setOpenDelete(false);
      fetchServices();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to delete service",
        "error",
      );
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress
          sx={{ color: theme.palette.primary.main }}
          size={52}
          thickness={4}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-end" },
          gap: 2,
          mb: 4,
          width: "100%",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing={-0.5}
            sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
          >
            Services
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage hotel amenities and extra services
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddNew}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            px: 4,
            py: 1.2,
            textTransform: "none",
            boxShadow: "none",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Add Service
        </Button>
      </Box>

      {/* Mobile Card View */}
      {isMobile ? (
        <Box>
          {services.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              py={5}
            >
              No services found. Click "Add Service" to create one.
            </Typography>
          ) : (
            services.map((service) => (
              <Card
                key={service._id}
                sx={{ mb: 2, borderRadius: "12px", boxShadow: 2 }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {service.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(service)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(service)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Chip
                        icon={getCategoryIcon(service.category)}
                        label={service.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                      <Typography
                        variant="body1"
                        fontWeight={800}
                        color="success.main"
                      >
                        ${service.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Taxable:
                      </Typography>
                      {service.isTaxable ? (
                        <Chip
                          label="Yes"
                          size="small"
                          color="default"
                          sx={{ height: 22, fontSize: "0.7rem" }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No
                        </Typography>
                      )}
                    </Box>
                    {service.description && (
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                {[
                  "Name",
                  "Category",
                  "Price",
                  "Taxable",
                  "Description",
                  "Actions",
                ].map((h) => (
                  <TableCell
                    key={h}
                    align={h === "Actions" || h === "Price" ? "right" : "left"}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "text.secondary",
                      py: 2,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No services found. Click "Add Service" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow
                    key={service._id}
                    sx={{
                      "&:last-child td": { border: 0 },
                      "&:hover": { bgcolor: theme.palette.action.hover },
                      transition: "background 0.15s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {service.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getCategoryIcon(service.category)}
                        label={service.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="success.main"
                      >
                        ${service.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {service.isTaxable ? (
                        <Chip
                          label="Yes"
                          size="small"
                          color="default"
                          sx={{ height: 22, fontSize: "0.7rem" }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {service.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(service)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(service)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>
          {currentService ? "Edit Service" : "Add New Service"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField
              label="Service Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Price ($)"
                type="number"
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <TextField
                select
                label="Category"
                fullWidth
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as ServiceCategory,
                  })
                }
              >
                {Object.values(ServiceCategory).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isTaxable}
                  onChange={(e) =>
                    setFormData({ ...formData, isTaxable: e.target.checked })
                  }
                  color="primary"
                />
              }
              label="Service is Taxable"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenForm(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.price}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            Save Service
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{currentService?.name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenDelete(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
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
    </Box>
  );
};

export default ServicesPage;
