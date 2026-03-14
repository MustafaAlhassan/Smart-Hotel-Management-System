import React, { useState, useMemo } from "react";
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
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import {
  CheckCircleOutline,
  AccountCircle,
  ErrorOutline,
  KingBed,
  CheckCircle,
  People,
  Layers,
  NightsStay,
} from "@mui/icons-material";
import api from "../../services/api";
import { useHotel } from "../../context/HotelContext";

const steps = ["Booking Details", "Verification", "Guest Information"];

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

  const fetchAvailableRooms = async (checkIn: string, checkOut: string) => {
    try {
      const response = await api.get(
        `/bookings/available-rooms?checkIn=${checkIn}&checkOut=${checkOut}`,
      );
      const rooms = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setAvailableRooms(rooms);
    } catch (err) {
      console.error("Error fetching available rooms", err);
    }
  };

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

  const handleBookingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    setBookingData((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === "adults" || name === "children" ? Number(value) : value,
      };

      if (name === "checkInDate" || name === "checkOutDate") {
        const newCheckIn = name === "checkInDate" ? value : prev.checkInDate;
        const newCheckOut = name === "checkOutDate" ? value : prev.checkOutDate;
        if (
          newCheckIn &&
          newCheckOut &&
          new Date(newCheckOut) > new Date(newCheckIn)
        ) {
          fetchAvailableRooms(newCheckIn, newCheckOut);
          return { ...updated, room: "" };
        }
      }

      return updated;
    });
  };

  const handleGuestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    setGuestData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep0Next = () => {
    if (
      !bookingData.checkInDate ||
      !bookingData.checkOutDate ||
      !bookingData.room
    ) {
      setError("Please select dates and a room.");
      return;
    }
    setError(null);
    setActiveStep(1);
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
        setActiveStep(3);
      } else {
        setGuestExists(false);
        setActiveStep(2);
      }
    } catch (err) {
      setGuestExists(false);
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = () => {
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
    setActiveStep(3);
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

  const datesReady =
    !!bookingData.checkInDate &&
    !!bookingData.checkOutDate &&
    new Date(bookingData.checkOutDate) > new Date(bookingData.checkInDate);

  const RoomCard = ({ room }: { room: any }) => {
    const price = room.basePrice || room.roomType?.basePrice || 0;
    const isSelected = String(bookingData.room) === String(room._id);
    const capacity = room.roomType?.capacity;

    return (
      <Box
        onClick={() => {
          setError(null);
          setBookingData((prev) => ({ ...prev, room: String(room._id) }));
        }}
        sx={{
          position: "relative",
          borderRadius: "16px",
          cursor: "pointer",
          overflow: "hidden",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1.5px solid",
          borderColor: isSelected ? "primary.main" : "divider",
          transform: isSelected ? "translateY(-3px)" : "none",
          boxShadow: isSelected
            ? "0 12px 32px rgba(0,0,0,0.25)"
            : "0 2px 8px rgba(0,0,0,0.08)",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
            borderColor: "primary.main",
          },
        }}
      >
        {/* Top color band */}
        <Box
          sx={{
            height: 6,
            background: isSelected
              ? "linear-gradient(90deg, #0288d1, #26c6da)"
              : "linear-gradient(90deg, #37474f, #546e7a)",
            transition: "background 0.25s",
          }}
        />

        <Box sx={{ p: 2.5 }}>
          {/* Header row */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: isSelected
                    ? "linear-gradient(135deg, #0288d1, #26c6da)"
                    : "linear-gradient(135deg, #37474f, #546e7a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.25s",
                }}
              >
                <KingBed sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="700"
                  lineHeight={1.2}
                  sx={{ letterSpacing: "-0.01em" }}
                >
                  Room {room.roomNumber}
                </Typography>
                {room.floor != null && (
                  <Box display="flex" alignItems="center" gap={0.4} mt={0.2}>
                    <Layers sx={{ fontSize: 11, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      Floor {room.floor}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {isSelected ? (
              <CheckCircle
                sx={{ fontSize: 22, color: "primary.main", flexShrink: 0 }}
              />
            ) : (
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "1.5px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              />
            )}
          </Box>

          {/* Room type badge */}
          {room.roomType?.name && (
            <Chip
              label={room.roomType.name}
              size="small"
              sx={{
                mb: 2,
                height: 22,
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                borderRadius: "6px",
                bgcolor: isSelected ? "primary.main" : "action.hover",
                color: isSelected ? "primary.contrastText" : "text.secondary",
                border: "none",
                transition: "all 0.25s",
              }}
            />
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Stats row */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography
                variant="h5"
                fontWeight="800"
                color={isSelected ? "primary.main" : "text.primary"}
                lineHeight={1}
                sx={{
                  transition: "color 0.25s",
                  letterSpacing: "-0.02em",
                }}
              >
                {hotel?.currency}{price}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.4} mt={0.3}>
                <NightsStay sx={{ fontSize: 11, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  per night
                </Typography>
              </Box>
            </Box>

            <Box textAlign="right">
              {nights > 0 && (
                <>
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    color={isSelected ? "primary.main" : "text.primary"}
                    lineHeight={1}
                    sx={{ transition: "color 0.25s" }}
                  >
                    {hotel?.currency}{nights * price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {nights} night{nights !== 1 ? "s" : ""}
                  </Typography>
                </>
              )}
              {capacity && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.4}
                  justifyContent="flex-end"
                  mt={nights > 0 ? 0.5 : 0}
                >
                  <People sx={{ fontSize: 11, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.secondary">
                    Up to {capacity}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
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
              <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Check In"
                    name="checkInDate"
                    InputLabelProps={{ shrink: true }}
                    value={bookingData.checkInDate}
                    onChange={handleBookingInputChange}
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
                    onChange={handleBookingInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Adults"
                    name="adults"
                    inputProps={{ min: 1 }}
                    value={bookingData.adults}
                    onChange={handleBookingInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Children"
                    name="children"
                    inputProps={{ min: 0 }}
                    value={bookingData.children}
                    onChange={handleBookingInputChange}
                  />
                </Grid>

                {/* ── Room Selection Section ── */}
                <Grid item xs={12} width={"100%"}>
                  <Box sx={{ mt: 1 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={2.5}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "10px",
                            bgcolor: datesReady ? "primary.main" : "action.disabledBackground",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.3s",
                          }}
                        >
                          <KingBed sx={{ fontSize: 17, color: "#fff" }} />
                        </Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight="700"
                          color={datesReady ? "text.primary" : "text.disabled"}
                          sx={{ letterSpacing: "-0.01em" }}
                        >
                          Select a Room
                        </Typography>
                      </Box>

                      {datesReady && availableRooms.length > 0 && (
                        <Chip
                          label={`${availableRooms.length} available`}
                          size="small"
                          color="success"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            borderRadius: "8px",
                            height: 26,
                          }}
                        />
                      )}
                    </Box>

                    {!datesReady ? (
                      <Box
                        sx={{
                          border: "1.5px dashed",
                          borderColor: "divider",
                          borderRadius: "16px",
                          py: 5,
                          textAlign: "center",
                          bgcolor: "action.hover",
                        }}
                      >
                        <KingBed
                          sx={{ fontSize: 36, color: "text.disabled", mb: 1 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.disabled"
                          fontWeight={500}
                        >
                          Select check-in and check-out dates
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Available rooms will appear here
                        </Typography>
                      </Box>
                    ) : availableRooms.length === 0 ? (
                      <Alert severity="warning" sx={{ borderRadius: "12px" }}>
                        No rooms available for the selected dates. Please try
                        different dates.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {availableRooms.map((room) => (
                          <Grid item xs={12} sm={6} md={4} key={room._id}>
                            <RoomCard room={room} />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
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
                    onChange={handleGuestInputChange}
                  />
                  <Divider>OR</Divider>
                  <TextField
                    fullWidth
                    label="Passport Number"
                    name="idNumber"
                    value={guestData.idNumber}
                    onChange={handleGuestInputChange}
                  />
                </Stack>
              </Box>
            )}

            {activeStep === 2 && (
              <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="First Name"
                    required
                    name="firstName"
                    value={guestData.firstName}
                    onChange={handleGuestInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    required
                    name="lastName"
                    value={guestData.lastName}
                    onChange={handleGuestInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Email"
                    required
                    name="email"
                    value={guestData.email}
                    onChange={handleGuestInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Phone"
                    required
                    name="phoneNumber"
                    value={guestData.phoneNumber}
                    onChange={handleGuestInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Passport Number"
                    required
                    name="idNumber"
                    value={guestData.idNumber}
                    onChange={handleGuestInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} width={"100%"}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={guestData.address}
                    onChange={handleGuestInputChange}
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
                onClick={() =>
                  setActiveStep((prev) =>
                    prev === 2 ? 1 : prev === 1 ? 0 : prev - 1,
                  )
                }
              >
                Back
              </Button>
              {activeStep === 0 ? (
                <Button variant="contained" onClick={handleStep0Next}>
                  Next
                </Button>
              ) : activeStep === 1 ? (
                <Button
                  variant="contained"
                  onClick={checkGuest}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Search"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleFinalSubmit}
                  disabled={loading}
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