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
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import {
  CheckCircleOutline,
  AccountCircle,
  ErrorOutline,
} from "@mui/icons-material";
import api from "../../services/api";
import { useHotel } from "../../context/HotelContext";

const steps = ["Verification", "Guest Information", "Booking Details"];

const BookingPage = () => {
  const { hotel } = useHotel();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [guestExists, setGuestExists] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
    address: "",
  });

  const [bookingData, setBookingData] = useState({
    room: "",
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
    notes: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("/rooms");
        const rooms = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setAvailableRooms(
          rooms.filter(
            (r: any) => String(r.status).toLowerCase() === "available",
          ),
        );
      } catch (err) {
        console.error("Error fetching rooms", err);
      }
    };
    fetchRooms();
  }, []);

  const selectedRoomObj = useMemo(() => {
    if (!bookingData.room) return null;
    return availableRooms.find(
      (r) => String(r._id) === String(bookingData.room),
    );
  }, [bookingData.room, availableRooms]);

  const pricePerNight = useMemo(() => {
    if (!selectedRoomObj) return 0;
    return (
      selectedRoomObj.basePrice || selectedRoomObj.roomType?.basePrice || 0
    );
  }, [selectedRoomObj]);

  const nights = useMemo(() => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  }, [bookingData.checkInDate, bookingData.checkOutDate]);

  const basePrice = nights * pricePerNight;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    if (activeStep <= 1) {
      setGuestData((prev) => ({ ...prev, [name]: value }));
    } else {
      setBookingData((prev) => ({
        ...prev,
        [name]:
          name === "adults" || name === "children" ? Number(value) : value,
      }));
    }
  };

  const checkGuest = async () => {
    if (!guestData.idNumber && !guestData.email) {
      setError("Please enter Email or Passport Number.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/guests");
      const allGuests = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const foundGuest = allGuests.find(
        (g: any) =>
          (guestData.idNumber && g.idNumber === guestData.idNumber) ||
          (guestData.email &&
            g.email?.toLowerCase() === guestData.email?.toLowerCase()),
      );

      if (foundGuest) {
        setGuestExists(true);
        setGuestId(foundGuest._id);
        setGuestData({
          firstName: foundGuest.firstName || "",
          lastName: foundGuest.lastName || "",
          email: foundGuest.email || "",
          phoneNumber: foundGuest.phoneNumber || "",
          idNumber: foundGuest.idNumber || "",
          address: foundGuest.address || "",
        });
        setActiveStep(2);
      } else {
        setGuestExists(false);
        setActiveStep(1);
      }
    } catch (err) {
      setGuestExists(false);
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Next = () => {
    const missing =
      !guestData.firstName ||
      !guestData.lastName ||
      !guestData.email ||
      !guestData.phoneNumber ||
      !guestData.idNumber;
    if (missing) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setActiveStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalGuestId = guestId;

      if (!guestExists) {
        try {
          const guestRes = await api.post("/guests", guestData);
          finalGuestId = guestRes.data.data?._id || guestRes.data._id;
        } catch (guestErr: any) {
          const isDuplicate =
            guestErr.response?.status === 400 ||
            guestErr.response?.data?.message?.includes("exists");

          if (isDuplicate) {
            try {
              const allGuestsRes = await api.get("/guests");
              const allGuests = Array.isArray(allGuestsRes.data)
                ? allGuestsRes.data
                : allGuestsRes.data.data || [];

              const existingGuest = allGuests.find(
                (g: any) => String(g.idNumber) === String(guestData.idNumber),
              );

              if (existingGuest) {
                finalGuestId = existingGuest._id;
              } else {
                throw new Error(
                  "Guest exists but could not be recovered. Check ID.",
                );
              }
            } catch (recoverErr) {
              throw new Error("Failed to recover existing guest details.");
            }
          } else {
            const errorData = guestErr.response?.data;
            const msg = errorData?.errors
              ? errorData.errors.join(", ")
              : errorData?.message;
            throw new Error(msg || "Failed to create guest profile.");
          }
        }
      }

      if (!finalGuestId) throw new Error("Missing Guest ID.");

      await api.post("/bookings", {
        guest: finalGuestId,
        room: bookingData.room,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        adults: Number(bookingData.adults),
        children: Number(bookingData.children),
        status: "Confirmed",
        notes: bookingData.notes || "",
      });

      setActiveStep(3);
    } catch (err: any) {
      const responseData = err.response?.data;
      let errorMsg = "Booking failed.";

      if (responseData) {
        if (responseData.errors && Array.isArray(responseData.errors)) {
          errorMsg = responseData.errors.join(" | ");
        } else if (responseData.message) {
          errorMsg = responseData.message;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ width: "100%", px: { xs: 2, sm: 4, md: 8 }, py: { xs: 3, md: 6 } }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        mb={{ xs: 3, md: 6 }}
        color="primary"
        sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
      >
        Create Reservation
      </Typography>

      {activeStep === 3 ? (
        <Paper
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 4,
            textAlign: "center",
            boxShadow: 3,
          }}
        >
          <CheckCircleOutline color="success" sx={{ fontSize: 100, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold">
            Success!
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 4 }}
            onClick={() => window.location.reload()}
          >
            New Booking
          </Button>
        </Paper>
      ) : (
        <>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 4, md: 6 },
              borderRadius: 4,
              mb: 4,
              boxShadow: 2,
            }}
          >
            <Stepper
              activeStep={activeStep}
              sx={{ mb: { xs: 4, md: 6 } }}
              alternativeLabel
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert
                severity="error"
                icon={<ErrorOutline />}
                sx={{ mb: 4, borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <Box sx={{ maxWidth: 500, mx: "auto", textAlign: "center" }}>
                <Typography variant="h6" mb={3}>
                  Guest Search
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={guestData.email}
                    onChange={handleInputChange}
                  />
                  <Divider>OR</Divider>
                  <TextField
                    fullWidth
                    label="Passport Number"
                    name="idNumber"
                    value={guestData.idNumber}
                    onChange={handleInputChange}
                  />
                </Stack>
              </Box>
            )}

            {activeStep === 1 && (
              <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="First Name"
                    required
                    name="firstName"
                    value={guestData.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    required
                    name="lastName"
                    value={guestData.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Email"
                    required
                    name="email"
                    value={guestData.email}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Phone"
                    required
                    name="phoneNumber"
                    value={guestData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Passport Number"
                    required
                    name="idNumber"
                    value={guestData.idNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={guestData.address}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
                <Grid item xs={12} width={"100%"}>
                  <TextField
                    select
                    fullWidth
                    label="Select Room"
                    name="room"
                    value={bookingData.room}
                    onChange={handleInputChange}
                  >
                    {availableRooms.map((room) => (
                      <MenuItem key={room._id} value={room._id}>
                        Room {room.roomNumber} ({hotel?.currency}
                        {room.basePrice || room.roomType?.basePrice}/night)
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Check In"
                    name="checkInDate"
                    InputLabelProps={{ shrink: true }}
                    value={bookingData.checkInDate}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Check Out"
                    name="checkOutDate"
                    InputLabelProps={{ shrink: true }}
                    value={bookingData.checkOutDate}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Adults"
                    name="adults"
                    value={bookingData.adults}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Children"
                    name="children"
                    value={bookingData.children}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: { xs: 4, md: 6 },
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(activeStep - 1)}
              >
                Back
              </Button>
              {activeStep === 0 ? (
                <Button
                  variant="contained"
                  onClick={checkGuest}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Search"}
                </Button>
              ) : activeStep === 1 ? (
                <Button variant="contained" onClick={handleStep1Next}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleFinalSubmit}
                  disabled={
                    loading ||
                    !bookingData.room ||
                    !bookingData.checkInDate ||
                    !bookingData.checkOutDate
                  }
                >
                  {loading ? <CircularProgress size={24} /> : "Confirm & Pay"}
                </Button>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, boxShadow: 2 }}>
            <Box display="flex" justifyContent="center" mb={3}>
              <Typography
                variant="h6"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <AccountCircle color="primary" /> Reservation Summary
              </Typography>
            </Box>

            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              gap={3}
            >
              <Stack spacing={0.5} flex={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  GUEST DETAILS
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {guestData.firstName
                    ? `${guestData.firstName} ${guestData.lastName}`
                    : "Pending..."}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {guestData.idNumber}
                </Typography>
              </Stack>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
              <Divider sx={{ display: { xs: "block", md: "none" } }} />

              <Stack
                spacing={0.5}
                flex={1}
                sx={{ textAlign: { md: "center" } }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  STAY DETAILS
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {selectedRoomObj
                    ? `Room ${selectedRoomObj.roomNumber}`
                    : "No Room"}
                </Typography>
                <Typography variant="body2">
                  {bookingData.checkInDate} / {bookingData.checkOutDate}
                </Typography>
              </Stack>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
              <Divider sx={{ display: { xs: "block", md: "none" } }} />

              <Stack spacing={0.5} flex={1} sx={{ textAlign: { md: "right" } }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  TOTAL AMOUNT
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="900"
                  color="primary"
                  sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
                >
                  {hotel?.currency}
                  {basePrice}
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default BookingPage;
