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
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import api from "../services/api";

const steps = ["Email Verification", "Guest Information", "Booking Details"];

const ReservationPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
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

        const filtered = rooms.filter(
          (r: any) => String(r.status).toLowerCase() === "available",
        );

        setAvailableRooms(filtered);
      } catch {
        setError("Failed to load rooms.");
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const selectedRoomObj = useMemo(() => {
    return availableRooms.find(
      (r) => String(r._id) === String(bookingData.room),
    );
  }, [bookingData.room, availableRooms]);

  const pricePerNight =
    selectedRoomObj?.basePrice ||
    selectedRoomObj?.type?.basePrice ||
    selectedRoomObj?.roomType?.basePrice ||
    0;

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

    if (error) setError(null);

    const cleanedValue =
      name === "email"
        ? value.trim().toLowerCase()
        : name === "idNumber"
          ? value.trim().toUpperCase()
          : value;

    if (activeStep === 0 || activeStep === 1) {
      setGuestData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setBookingData((prev) => ({
        ...prev,
        [name]:
          name === "adults" || name === "children" ? Number(value) : value,
      }));
    }
  };

  const checkGuest = async () => {
    if (!guestData.email && !guestData.idNumber) {
      setError("Please enter Email or Passport ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let foundGuest = null;

      // 🔎 Search by Email
      if (guestData.email) {
        try {
          const res = await api.get(`/guests/email/${guestData.email}`);
          foundGuest = res.data?.data || res.data;
        } catch (err: any) {
          if (err.response?.status !== 404) throw err;
        }
      }

      // 🔎 If not found, search by Passport ID
      if (!foundGuest && guestData.idNumber) {
        try {
          const res = await api.get(`/guests/id/${guestData.idNumber}`);
          foundGuest = res.data?.data || res.data;
        } catch (err: any) {
          if (err.response?.status !== 404) throw err;
        }
      }

      if (foundGuest) {
        handleGuestFound(foundGuest);
        return;
      }

      // ❌ Not Found → go to Guest Info step
      setGuestExists(false);
      setGuestId(null);
      setActiveStep(1);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Error verifying guest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestFound = (data: any) => {
    const guest = data.data || data;

    setGuestExists(true);
    setGuestId(guest._id);

    setGuestData({
      firstName: guest.firstName || "",
      lastName: guest.lastName || "",
      email: guest.email || "",
      phoneNumber: guest.phoneNumber || "",
      idNumber: guest.idNumber || "",
    });

    // ✅ Skip Guest Info → go directly to Reservation step
    setActiveStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!bookingData.room) {
      setError("Please select a room.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalGuestId = guestId;

      if (!guestExists) {
        const guestRes = await api.post("/guests", guestData);
        finalGuestId = guestRes.data.data?._id || guestRes.data._id;
      }

      if (!finalGuestId) {
        throw new Error(
          "Failed to generate Guest ID. Please check guest information.",
        );
      }

      await api.post("/bookings", {
        ...bookingData,
        guest: finalGuestId,
        basePrice,
      });

      setActiveStep(3);
    } catch (err: any) {
      console.error("Booking Error:", err);
      // 4. Show the REAL error message from the backend
      const errorMessage =
        err.response?.data?.message || err.message || "Booking failed.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 3, md: 8 }, py: 6 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6}>
        New Reservation
      </Typography>

      {activeStep === 3 ? (
        <Paper
          sx={{ p: 8, borderRadius: 3, textAlign: "center", minHeight: 400 }}
        >
          <CheckCircleOutline color="success" sx={{ fontSize: 90, mb: 3 }} />
          <Typography variant="h5" fontWeight="bold">
            Booking Successful
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 6, borderRadius: 3, mb: 5, minHeight: 450 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <TextField
                fullWidth
                size="medium"
                sx={{ "& .MuiInputBase-root": { height: 56 } }}
                label="Email Address"
                name="email"
                value={guestData.email}
                onChange={handleInputChange}
              />
            )}

            {activeStep === 1 && (
              <Grid container spacing={4}>
                {[
                  { label: "First Name", name: "firstName" },
                  { label: "Last Name", name: "lastName" },
                  { label: "Passport ID", name: "idNumber" },
                  { label: "Phone Number", name: "phoneNumber" },
                ].map((field) => (
                  <Grid item xs={12} md={6} key={field.name}>
                    <TextField
                      size="medium"
                      sx={{
                        "& .MuiInputBase-root": { height: 56 },
                        width: "250px",
                      }}
                      label={field.label}
                      name={field.name}
                      value={(guestData as any)[field.name]}
                      onChange={handleInputChange}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {roomsLoading ? (
                    <CircularProgress />
                  ) : (
                    <TextField
                      select
                      size="medium"
                      sx={{
                        "& .MuiInputBase-root": { height: 56 },
                        width: "250px",
                      }}
                      label="Select Room"
                      name="room"
                      value={bookingData.room}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">Select Room</MenuItem>
                      {availableRooms.map((room) => (
                        <MenuItem key={room._id} value={room._id}>
                          Room {room.roomNumber}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    type="date"
                    size="medium"
                    sx={{
                      "& .MuiInputBase-root": { height: 56 },
                      width: "250px",
                    }}
                    label="Check In"
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
                    size="medium"
                    sx={{
                      "& .MuiInputBase-root": { height: 56 },
                      width: "250px",
                    }}
                    label="Check Out"
                    name="checkOutDate"
                    InputLabelProps={{ shrink: true }}
                    value={bookingData.checkOutDate}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 6 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => prev - 1)}
              >
                Back
              </Button>

              {activeStep === 0 && (
                <Button variant="contained" onClick={checkGuest}>
                  {loading ? <CircularProgress size={20} /> : "Next"}
                </Button>
              )}

              {activeStep === 1 && (
                <Button variant="contained" onClick={() => setActiveStep(2)}>
                  Next
                </Button>
              )}

              {activeStep === 2 && (
                <Button variant="contained" onClick={handleFinalSubmit}>
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    `Confirm ($${basePrice})`
                  )}
                </Button>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 6, borderRadius: 3, minHeight: 200 }}>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              columnSpacing={6}
            >
              <Grid item xs={12} md={4}>
                <Stack spacing={1} sx={{ minHeight: 70 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Guest
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {guestData.firstName
                      ? `${guestData.firstName} ${guestData.lastName}`
                      : "---"}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4} textAlign="center">
                <Stack spacing={1} sx={{ minHeight: 70 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Room
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedRoomObj
                      ? `Room ${selectedRoomObj.roomNumber}`
                      : "---"}
                  </Typography>
                  {nights > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {nights} Nights
                    </Typography>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={4} textAlign="right">
                <Stack spacing={1} sx={{ minHeight: 70 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    ${basePrice}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ReservationPage;
