import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Person,
  EventAvailable,
  CheckCircleOutline,
  AttachMoney,
  Bed,
  CalendarMonth,
} from "@mui/icons-material";
import api from "../services/api";

const steps = ["Guest Information", "Booking Details"];

const ReservationPage = () => {
  const theme = useTheme();

  // --- 1. State ---
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
  });

  const [bookingData, setBookingData] = useState({
    room: "",
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
    notes: "",
  });

  // --- 2. Fetch Data ---
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("/rooms");
        // Handle various API structures safely
        const rooms = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        const available = rooms.filter(
          (r: any) =>
            // Check strictly for available status (case insensitive)
            String(r.status).toLowerCase() === "available",
        );
        console.log("Loaded Rooms:", available); // For debugging
        setAvailableRooms(available);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network error: Could not load rooms.");
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // --- 3. Smart Logic ---

  // A. Find the Room
  const selectedRoomObj = useMemo(() => {
    return availableRooms.find(
      (r) => String(r._id) === String(bookingData.room),
    );
  }, [bookingData.room, availableRooms]);

  // B. HELPER: Extract Price (The Fix for 0 Price)
  const getRoomPrice = (room: any) => {
    if (!room) return 0;
    // Check ALL possible field names for price
    const price =
      room.price ||
      room.basePrice ||
      room.cost ||
      room.rate ||
      room.amount ||
      0;
    return Number(price);
  };

  const roomPricePerNight = useMemo(
    () => getRoomPrice(selectedRoomObj),
    [selectedRoomObj],
  );

  // C. Calculate Nights
  const nights = useMemo(() => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [bookingData.checkInDate, bookingData.checkOutDate]);

  // D. Total Price
  const totalPrice = nights * roomPricePerNight;

  // --- 4. Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (activeStep === 0) {
      setGuestData((prev) => ({ ...prev, [name]: value }));
    } else {
      setBookingData((prev) => ({
        ...prev,
        [name]:
          name === "adults" || name === "children" ? Number(value) : value,
      }));
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (
        !guestData.firstName ||
        !guestData.lastName ||
        !guestData.phoneNumber
      ) {
        setError("Please fill in First Name, Last Name, and Phone.");
        return;
      }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const guestRes = await api.post("/guests", guestData);
      const guestId = guestRes.data.data?._id || guestRes.data._id;

      await api.post("/bookings", {
        ...bookingData,
        guest: guestId,
        totalPrice: totalPrice,
      });

      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Layout & Render ---
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="800" textAlign="center" mb={5}>
        New Reservation
      </Typography>

      {/* SUCCESS SCREEN */}
      {activeStep === 2 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          <CheckCircleOutline color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            Success!
          </Typography>
          <Typography color="text.secondary" paragraph>
            Booking created for {guestData.firstName}.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            New Booking
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* ======================= */}
          {/* LEFT: FORM AREA */}
          {/* ======================= */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* STEP 1: GUEST */}
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      display="flex"
                      gap={1}
                    >
                      <Person color="primary" /> Guest Details
                    </Typography>
                  </Grid>
                  {/* Perfect 50/50 Split */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={guestData.firstName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={guestData.lastName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phoneNumber"
                      value={guestData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Passport / ID"
                      name="idNumber"
                      value={guestData.idNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={guestData.email}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              )}

              {/* STEP 2: BOOKING (Fixed Alignment) */}
              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      display="flex"
                      gap={1}
                    >
                      <EventAvailable color="primary" /> Stay Details
                    </Typography>
                  </Grid>

                  {/* Room Selection (Full Row) */}
                  <Grid item xs={12}>
                    {roomsLoading ? (
                      <CircularProgress />
                    ) : (
                      <TextField
                        select
                        fullWidth
                        label="Select Room"
                        name="room"
                        value={bookingData.room}
                        onChange={handleInputChange}
                        helperText="Price is calculated automatically based on room selection"
                      >
                        {availableRooms.map((room) => (
                          <MenuItem key={room._id} value={room._id}>
                            Room {room.roomNumber} ({room.type}) — $
                            {getRoomPrice(room)}/night
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Grid>

                  {/* Dates (50/50 Row) */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Check-In"
                      name="checkInDate"
                      InputLabelProps={{ shrink: true }}
                      value={bookingData.checkInDate}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Check-Out"
                      name="checkOutDate"
                      InputLabelProps={{ shrink: true }}
                      value={bookingData.checkOutDate}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Guests (50/50 Row) */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Adults"
                      name="adults"
                      value={bookingData.adults}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Children"
                      name="children"
                      value={bookingData.children}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Notes (Full Row) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Notes"
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              )}

              {/* BUTTONS */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                {activeStep === 0 ? (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleFinalSubmit}
                    disabled={loading || !bookingData.room} // Removed strict price check to allow submission even if 0
                  >
                    {loading ? "Processing..." : `Confirm ($${totalPrice})`}
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* ======================= */}
          {/* BOTTOM: SUMMARY DASHBOARD */}
          {/* ======================= */}
          <Grid item xs={12}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, bgcolor: "background.paper" }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  {/* Guest Info */}
                  <Grid item xs={12} md={4}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        GUEST
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {guestData.firstName} {guestData.lastName}
                      </Typography>
                      <Typography variant="body2">
                        {guestData.phoneNumber}
                      </Typography>
                    </Stack>
                  </Grid>

                  {/* Room Info */}
                  <Grid item xs={12} md={4}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        ROOM
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {selectedRoomObj
                          ? `No. ${selectedRoomObj.roomNumber} - ${selectedRoomObj.type}`
                          : "Not Selected"}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarMonth fontSize="inherit" />
                        <Typography variant="body2">{nights} Nights</Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Price Info */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, bgcolor: theme.palette.action.hover }}
                    >
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Price/Night:</Typography>
                        <Typography variant="body2">
                          ${roomPricePerNight}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          TOTAL:
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary.main"
                          fontWeight="900"
                        >
                          ${totalPrice}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ReservationPage;
