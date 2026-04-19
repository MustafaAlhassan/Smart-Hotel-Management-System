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
  Person,
  Email,
  Phone,
  Badge,
  Home,
} from "@mui/icons-material";
import api from "../../services/api";
import { useHotel } from "../../context/HotelContext";

const API_BASE_URL = "http://localhost:5000";

const getFullImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http") || imagePath.startsWith("blob:"))
    return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

const steps = [
  "Booking Details",
  "Verification",
  "Guest Information",
  "Confirm",
];

const BookingPage = () => {
  const { hotel } = useHotel();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [guestExists, setGuestExists] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (guestData.email) params.email = guestData.email;
      if (guestData.idNumber) params.idNumber = guestData.idNumber;

      const response = await api.get("/guests/search", { params });
      const { found, data: foundGuest } = response.data;

      if (found && foundGuest) {
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
        setGuestId(null);
        setGuestData((prev) => ({
          ...prev,
          firstName: "",
          lastName: "",
          phoneNumber: "",
          address: "",
        }));
        setActiveStep(2);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setGuestExists(false);
        setGuestId(null);
        setGuestData((prev) => ({
          ...prev,
          firstName: "",
          lastName: "",
          phoneNumber: "",
          address: "",
        }));
        setActiveStep(2);
      } else {
        setError(
          err.response?.data?.message || "Search failed. Please try again.",
        );
      }
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
              const searchRes = await api.get("/guests/search", {
                params: { idNumber: guestData.idNumber },
              });
              if (searchRes.data.found && searchRes.data.data) {
                finalGuestId = searchRes.data.data._id;
              } else {
                throw new Error(
                  "Guest exists but could not be recovered. Check ID.",
                );
              }
            } catch {
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

      setBookingSuccess(true);
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
    const [imgError, setImgError] = useState(false);
    const imageUrl = getFullImageUrl(room.image);
    const hasImage = !!imageUrl && !imgError;

    return (
      <Box
        onClick={() => {
          setError(null);
          setBookingData((prev) => ({ ...prev, room: String(room._id) }));
        }}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          cursor: "pointer",
          border: isSelected ? "2px solid" : "1px solid",
          borderColor: isSelected ? "primary.main" : "rgba(255,255,255,0.08)",
          bgcolor: "rgba(255,255,255,0.03)",
          boxShadow: isSelected
            ? "0 0 0 3px rgba(2,136,209,0.18), 0 12px 40px rgba(0,0,0,0.5)"
            : "0 4px 24px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isSelected
              ? "0 0 0 3px rgba(2,136,209,0.25), 0 16px 48px rgba(0,0,0,0.6)"
              : "0 12px 40px rgba(0,0,0,0.6)",
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          {hasImage ? (
            <Box
              component="img"
              src={imageUrl}
              alt={`Room ${room.roomNumber}`}
              onError={() => setImgError(true)}
              sx={{
                width: 220,
                height: 125,
                objectFit: "fill",
                display: "block",
              }}
            />
          ) : (
            <Box
              sx={{
                height: 200,
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <KingBed sx={{ fontSize: 52, color: "rgba(255,255,255,0.15)" }} />
              <Typography
                variant="caption"
                color="text.disabled"
                fontWeight={600}
                letterSpacing={1}
              >
                NO IMAGE
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.20) 50%, transparent 100%)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {isSelected ? (
              <Box
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                <CheckCircle sx={{ fontSize: 18, color: "#fff" }} />
              </Box>
            ) : (
              <Box />
            )}
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              p: "12px 14px 10px",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              color="#fff"
              letterSpacing={-0.5}
              lineHeight={1}
            >
              {room.roomNumber}
            </Typography>
            {room.roomType?.name && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}
              >
                {room.roomType.name}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Layers sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Floor {room.floor}
              </Typography>
            </Box>
            <Box display="flex" alignItems="baseline" gap={0.3}>
              <Typography variant="body1" fontWeight={800} color="primary.main">
                {hotel?.currency}
                {price}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                / night
              </Typography>
            </Box>
          </Box>

          {(nights > 0 || capacity) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {capacity && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <People sx={{ fontSize: 14, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.secondary">
                    Up to {capacity}
                  </Typography>
                </Box>
              )}
              {nights > 0 && (
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="primary.main"
                  sx={{ ml: "auto" }}
                >
                  {hotel?.currency}
                  {nights * price}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    total
                  </Typography>
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const GuestInfoCard = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1.5px solid",
        borderColor: guestExists ? "success.main" : "primary.main",
        bgcolor: guestExists ? "success.main" + "0a" : "primary.main" + "0a",
        mb: 3,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CheckCircle
          sx={{
            color: guestExists ? "success.main" : "primary.main",
            fontSize: 20,
          }}
        />
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color={guestExists ? "success.main" : "primary.main"}
        >
          {guestExists ? "Existing Guest Found" : "New Guest"}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <Person sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Full Name
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {guestData.firstName} {guestData.lastName}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <Email sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Email
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {guestData.email || "—"}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Phone
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {guestData.phoneNumber || "—"}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Passport / ID
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {guestData.idNumber || "—"}
              </Typography>
            </Box>
          </Box>
        </Grid>
        {guestData.address && (
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <Home sx={{ fontSize: 16, color: "text.secondary" }} />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Address
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {guestData.address}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );

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

      {bookingSuccess ? (
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
            Booking Confirmed!
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            The reservation for {guestData.firstName} {guestData.lastName} has
            been created successfully.
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
                            bgcolor: datesReady
                              ? "primary.main"
                              : "action.disabledBackground",
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
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={room._id}
                            margin={"auto"}
                          >
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
                <Typography variant="h6" mb={1}>
                  Guest Search
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Enter the guest's email or passport number to check if they
                  already exist in the system.
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
              <Box>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  No guest found with those details. Please fill in the new
                  guest's information below.
                </Alert>
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
              </Box>
            )}

            {activeStep === 3 && (
              <Box sx={{ maxWidth: 680, mx: "auto" }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={3}
                  textAlign="center"
                >
                  Review & Confirm Booking
                </Typography>
                <GuestInfoCard />
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1.5px solid",
                    borderColor: "divider",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="text.secondary"
                    mb={2}
                    textTransform="uppercase"
                  >
                    Booking Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Room
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {selectedRoomObj
                          ? `Room ${selectedRoomObj.roomNumber}`
                          : "—"}
                        {selectedRoomObj?.roomType?.name
                          ? ` · ${selectedRoomObj.roomType.name}`
                          : ""}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Guests
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {bookingData.adults} adult
                        {bookingData.adults !== 1 ? "s" : ""}
                        {bookingData.children > 0
                          ? `, ${bookingData.children} child${bookingData.children !== 1 ? "ren" : ""}`
                          : ""}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Check-In
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {bookingData.checkInDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Check-Out
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {bookingData.checkOutDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Nights
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {nights}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Price / Night
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {hotel?.currency}
                        {pricePerNight}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Total Amount
                    </Typography>
                    <Typography variant="h5" fontWeight={900} color="primary">
                      {hotel?.currency}
                      {basePrice}
                    </Typography>
                  </Box>
                </Paper>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (optional)"
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingInputChange}
                  placeholder="Any special requests or notes..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Box>
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
                onClick={() => {
                  setError(null);
                  if (activeStep === 3) {
                    setActiveStep(guestExists ? 1 : 2);
                  } else {
                    setActiveStep((prev) => prev - 1);
                  }
                }}
              >
                Back
              </Button>
              {activeStep === 0 && (
                <Button variant="contained" onClick={handleStep0Next}>
                  Next
                </Button>
              )}
              {activeStep === 1 && (
                <Button
                  variant="contained"
                  onClick={checkGuest}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Search"}
                </Button>
              )}
              {activeStep === 2 && (
                <Button variant="contained" onClick={handleStep2Next}>
                  Next
                </Button>
              )}
              {activeStep === 3 && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  sx={{ px: 4, fontWeight: 700 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Confirm Booking"}
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
