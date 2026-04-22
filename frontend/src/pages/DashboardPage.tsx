import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Stack,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  alpha,
} from "@mui/material";
import {
  People,
  AttachMoney,
  AddCircleOutline,
  PersonAddAlt,
  MeetingRoom,
  Hotel,
  TrendingUp,
  EventAvailable,
  EventBusy,
  DonutLarge,
  CleaningServices,
  Handyman,
  Person,
  Check,
  CheckCircle,
  Checklist,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import api from "../services/api";
import type { DashboardData } from "../types/types";
import { useNavigate } from "react-router-dom";
import { useHotel } from "../context/HotelContext";
import { color } from "@mui/system";

const CARD_SIZE = 220;
const CHART_HEIGHT = 380;

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { hotel } = useHotel();
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const isHousekeeping = role === "HOUSEKEEPING";
  const isReceptionist = role === "RECEPTIONIST";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="80vh"
        gap={2}
      >
        <CircularProgress
          sx={{ color: theme.palette.primary.main }}
          size={52}
          thickness={4}
        />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) return null;

  const occupancyRate = data.rooms.occupancyRate
    ? parseFloat(data.rooms.occupancyRate)
    : data.rooms.total > 0
      ? Math.round((data.rooms.occupied / data.rooms.total) * 100)
      : 0;

  const availableRate = 100 - occupancyRate;

  const occupancyData = [
    { name: "Occupied", value: data.rooms.occupied },
    { name: "Available", value: data.rooms.available },
    { name: "Dirty", value: data.rooms.dirty || 0 },
    { name: "Maintenance", value: data.rooms.maintenance || 0 },
  ];

  const checkInsCount =
    (data.todayActivity as any).checkInsCount ??
    data.todayActivity.checkIns ??
    0;
  const checkOutsCount =
    (data.todayActivity as any).checkOutsCount ??
    data.todayActivity.checkOuts ??
    0;

  const arrivalsList = (data.todayActivity as any).arrivals || [];

  const rawTrend = (data.financials as any).revenueTrend || [];
  const formattedTrend = rawTrend.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    Revenue: item.amount || 0,
  }));

  const allStatCards = [
    {
      title: "Total Rooms",
      value: data.rooms.total,
      icon: <MeetingRoom />,
      color: theme.palette.primary.main,
      housekeepingVisible: true,
      receptionistVisible: true,
    },
    {
      title: "Occupied",
      value: data.rooms.occupied,
      icon: <Hotel />,
      color: theme.palette.error.main,
      housekeepingVisible: false,
      receptionistVisible: true,
    },
    {
      title: "Available",
      value: data.rooms.available,
      icon: <DonutLarge />,
      color: theme.palette.success.main,
      housekeepingVisible: true,
      receptionistVisible: true,
    },
    {
      title: "Dirty",
      value: data.rooms.dirty || 0,
      icon: <CleaningServices />,
      color: "#795548",
      housekeepingVisible: true,
      receptionistVisible: false,
    },
    {
      title: "Maintenance",
      value: data.rooms.maintenance || 0,
      icon: <Handyman />,
      color: "#607d8b",
      housekeepingVisible: false,
      receptionistVisible: false,
    },
    {
      title: "Guests",
      value: data.guests.total,
      icon: <People />,
      color: theme.palette.info.main,
      housekeepingVisible: false,
      receptionistVisible: true,
    },
    {
      title: "Today's Check-Ins",
      value: checkInsCount,
      icon: <EventAvailable />,
      color: theme.palette.primary.main,
      housekeepingVisible: false,
      receptionistVisible: true,
    },
    {
      title: "Today's Check-Outs",
      value: checkOutsCount,
      icon: <EventBusy />,
      color: theme.palette.error.main,
      housekeepingVisible: false,
      receptionistVisible: true,
    },
  ];

  const statCards = isHousekeeping
    ? allStatCards.filter((c) => c.housekeepingVisible)
    : isReceptionist
      ? allStatCards.filter((c) => c.receptionistVisible)
      : allStatCards;

  const StatCard = ({ title, value, icon, color }: any) => (
    <Paper
      elevation={0}
      sx={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          bgcolor: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h5"
        fontWeight={800}
        color="text.primary"
        lineHeight={1}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        textAlign="center"
        px={1}
      >
        {title}
      </Typography>
    </Paper>
  );

  const ChartCard = ({ title, children, height = CHART_HEIGHT }: any) => (
    <Paper
      elevation={0}
      sx={{
        height,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box px={3} pt={2.5} pb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, p: 2, minHeight: 0 }}>{children}</Box>
    </Paper>
  );

  const tooltipStyle1 = {
    contentStyle: {
      borderRadius: 10,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
      fontSize: 12,
    },
  };

  const tooltipStyle2 = {
    contentStyle: {
      borderRadius: 10,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
      fontSize: 12,
      backgroundColor: theme.darken,
    },
  };

  const allTableRows = [
    {
      metric: "Total Rooms",
      icon: (
        <MeetingRoom
          fontSize="small"
          sx={{ color: theme.palette.primary.main }}
        />
      ),
      value: data.rooms.total,
      detail: `${data.rooms.available} ready for check-in`,
      housekeepingVisible: true,
      receptionistVisible: true,
    },
    {
      metric: "Dirty Rooms",
      icon: <CleaningServices fontSize="small" sx={{ color: "#795548" }} />,
      value: data.rooms.dirty || 0,
      detail: "Requires housekeeping",
      housekeepingVisible: true,
      receptionistVisible: false,
    },
    {
      metric: "Maintenance",
      icon: <Handyman fontSize="small" sx={{ color: "#607d8b" }} />,
      value: data.rooms.maintenance || 0,
      detail: "Out of service",
      housekeepingVisible: false,
      receptionistVisible: false,
    },
    {
      metric: "Occupied Rooms",
      icon: <Hotel fontSize="small" sx={{ color: theme.palette.error.main }} />,
      value: data.rooms.occupied,
      detail: `${occupancyRate}% occupancy rate`,
      housekeepingVisible: false,
      receptionistVisible: true,
    },
    {
      metric: "Check-Ins Today",
      icon: (
        <EventAvailable
          fontSize="small"
          sx={{ color: theme.palette.primary.main }}
        />
      ),
      value: checkInsCount,
      detail: "Guests arrived",
      housekeepingVisible: false,
      receptionistVisible: true,
    },
    {
      metric: "Check-Outs Today",
      icon: (
        <EventBusy fontSize="small" sx={{ color: theme.palette.error.main }} />
      ),
      value: checkOutsCount,
      detail: "Guests departed",
      housekeepingVisible: false,
      receptionistVisible: true,
    },
    {
      metric: "Monthly Revenue",
      icon: (
        <AttachMoney
          fontSize="small"
          sx={{ color: theme.palette.success.main }}
        />
      ),
      value: `${hotel?.currency}${data.financials.monthlyRevenue.toLocaleString()}`,
      detail: "MTD Performance",
      housekeepingVisible: false,
      receptionistVisible: false,
    },
  ];

  const tableRows = isHousekeeping
    ? allTableRows.filter((r) => r.housekeepingVisible)
    : isReceptionist
      ? allTableRows.filter((r) => r.receptionistVisible)
      : allTableRows;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 5 },
        width: "100%",
        boxSizing: "border-box",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h4" fontWeight={900} letterSpacing={-0.5}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box display="flex" justifyContent="center" mb={5}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, ${CARD_SIZE}px)`,
            justifyContent: "center",
            width: "100%",
            gap: 2.5,
          }}
        >
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </Box>
      </Box>

      {/* Admin / Manager View */}
      {!isHousekeeping && !isReceptionist && (
        <>
          <Grid container spacing={2.5} mb={3} justifyContent="center">
            <Grid item xs={12} md={4} sx={{ minWidth: "300px" }}>
              <ChartCard title="Room Distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      innerRadius="52%"
                      outerRadius="78%"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={theme.palette.error.main} />
                      <Cell fill={theme.palette.success.main} />
                      <Cell fill="#795548" />
                      <Cell fill="#607d8b" />
                    </Pie>
                    <Tooltip {...tooltipStyle1} />
                    <Legend iconType="circle" iconSize={9} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={4} sx={{ minWidth: "300px" }}>
              <ChartCard title="Today's arrivals">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {arrivalsList.length} guest
                      {arrivalsList.length !== 1 ? "s" : ""} expected
                    </Typography>
                    <Chip
                      label={`${arrivalsList.length} arriving`}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
                    />
                  </Box>

                  <Button
                    onClick={() => navigate("/all-reservations")}
                    fullWidth
                    variant="outlined"
                    startIcon={
                      <Checklist sx={{ fontSize: "16px !important" }} />
                    }
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      textTransform: "none",
                      mb: 1.5,
                      borderColor: "divider",
                      color: "text.secondary",
                      "&:hover": {
                        borderColor: "primary.main",
                        color: "primary.main",
                      },
                    }}
                  >
                    Check reservations
                  </Button>

                  <Box sx={{ flex: 1, overflow: "auto" }}>
                    {arrivalsList.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body2" color="text.disabled">
                          No arrivals scheduled today
                        </Typography>
                      </Box>
                    ) : (
                      <List dense disablePadding>
                        {arrivalsList.slice(0, 6).map((booking: any) => {
                          const firstName = booking.guest?.firstName || "";
                          const lastName = booking.guest?.lastName || "";
                          const initials =
                            `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
                          return (
                            <ListItem
                              key={booking._id}
                              sx={{
                                px: 1,
                                py: 0.8,
                                borderRadius: 2,
                                "&:hover": { bgcolor: "action.hover" },
                              }}
                            >
                              <ListItemAvatar sx={{ minWidth: 44 }}>
                                <Avatar
                                  sx={{
                                    width: 34,
                                    height: 34,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.12,
                                    ),
                                    color: "primary.main",
                                  }}
                                >
                                  {initials || <Person sx={{ fontSize: 16 }} />}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    noWrap
                                  >
                                    {firstName} {lastName}
                                  </Typography>
                                }
                                secondary={
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    mt={0.2}
                                  >
                                    <Box
                                      sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        bgcolor: "success.main",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Room {booking.room?.roomNumber || "N/A"}
                                    </Typography>
                                  </Stack>
                                }
                              />
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                Check-in
                              </Typography>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                </Box>
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={4} sx={{ minWidth: "300px" }}>
              <ChartCard title="Quick Actions">
                <Stack spacing={2.5} height="100%" justifyContent="center">
                  <Button
                    onClick={() => navigate("/booking")}
                    fullWidth
                    variant="contained"
                    startIcon={<AddCircleOutline />}
                    sx={{
                      borderRadius: 2.5,
                      py: 2,
                      fontWeight: 700,
                      boxShadow: "none",
                    }}
                  >
                    Create New Booking
                  </Button>
                  <Button
                    onClick={() => navigate("/guests")}
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonAddAlt />}
                    sx={{
                      borderRadius: 2.5,
                      py: 2,
                      fontWeight: 700,
                      borderWidth: 2,
                    }}
                  >
                    Add New Guest
                  </Button>
                  <Divider />
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Occupancy Rate
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {occupancyRate}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={occupancyRate}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: theme.palette.action.hover,
                        "& .MuiLinearProgress-bar": { borderRadius: 4 },
                      }}
                    />
                  </Box>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Availability Rate
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {availableRate}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={availableRate}
                      color="success"
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: theme.palette.action.hover,
                        "& .MuiLinearProgress-bar": { borderRadius: 4 },
                      }}
                    />
                  </Box>
                </Stack>
              </ChartCard>
            </Grid>
          </Grid>

          <Grid container spacing={2.5} mb={2.5} justifyContent="center">
            <Grid item xs={12} md={8} sx={{ width: "100%" }}>
              <ChartCard title="Revenue Trend (Last 7 Days)">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedTrend}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={theme.palette.success.main}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={theme.palette.success.main}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(val) =>
                        `${hotel?.currency}${val / 1000}k`
                      }
                    />
                    <Tooltip
                      {...tooltipStyle2}
                      formatter={(value: number) => [
                        `${hotel?.currency}${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="Revenue"
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      fill="url(#revGrad)"
                      dot={{ r: 4, fill: theme.palette.success.main }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </>
      )}

      {/* Receptionist View */}
      {isReceptionist && (
        <Grid container spacing={2.5} mb={2.5} justifyContent="center">
          <Grid item xs={12} md={4} sx={{ minWidth: "300px" }}>
            <ChartCard title="Today's arrivals">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {arrivalsList.length} guest
                    {arrivalsList.length !== 1 ? "s" : ""} expected
                  </Typography>
                  <Chip
                    label={`${arrivalsList.length} arriving`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
                  />
                </Box>

                <Button
                  onClick={() => navigate("/all-reservations")}
                  fullWidth
                  variant="outlined"
                  startIcon={<Checklist sx={{ fontSize: "16px !important" }} />}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    textTransform: "none",
                    mb: 1.5,
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                  }}
                >
                  Check reservations
                </Button>

                <Box sx={{ flex: 1, overflow: "auto" }}>
                  {arrivalsList.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.disabled">
                        No arrivals scheduled today
                      </Typography>
                    </Box>
                  ) : (
                    <List dense disablePadding>
                      {arrivalsList.slice(0, 6).map((booking: any) => {
                        const firstName = booking.guest?.firstName || "";
                        const lastName = booking.guest?.lastName || "";
                        const initials =
                          `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
                        return (
                          <ListItem
                            key={booking._id}
                            sx={{
                              px: 1,
                              py: 0.8,
                              borderRadius: 2,
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 44 }}>
                              <Avatar
                                sx={{
                                  width: 34,
                                  height: 34,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.12,
                                  ),
                                  color: "primary.main",
                                }}
                              >
                                {initials || <Person sx={{ fontSize: 16 }} />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  noWrap
                                >
                                  {firstName} {lastName}
                                </Typography>
                              }
                              secondary={
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mt={0.2}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      bgcolor: "success.main",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Room {booking.room?.roomNumber || "N/A"}
                                  </Typography>
                                </Stack>
                              }
                            />
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              Check-in
                            </Typography>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Box>
              </Box>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4} sx={{ minWidth: "300px" }}>
            <ChartCard title="Quick Actions">
              <Stack spacing={2.5} height="100%" justifyContent="center">
                <Button
                  onClick={() => navigate("/booking")}
                  fullWidth
                  variant="contained"
                  startIcon={<AddCircleOutline />}
                  sx={{
                    borderRadius: 2.5,
                    py: 2,
                    fontWeight: 700,
                    boxShadow: "none",
                  }}
                >
                  Create New Booking
                </Button>
                <Button
                  onClick={() => navigate("/guests")}
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonAddAlt />}
                  sx={{
                    borderRadius: 2.5,
                    py: 2,
                    fontWeight: 700,
                    borderWidth: 2,
                  }}
                >
                  Add New Guest
                </Button>
                <Divider />
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Occupancy Rate
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {occupancyRate}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={occupancyRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: theme.palette.action.hover,
                      "& .MuiLinearProgress-bar": { borderRadius: 4 },
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Availability Rate
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {availableRate}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={availableRate}
                    color="success"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: theme.palette.action.hover,
                      "& .MuiLinearProgress-bar": { borderRadius: 4 },
                    }}
                  />
                </Box>
              </Stack>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {/* Table Section */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box px={3} pt={2.5} pb={2}>
          <Typography variant="subtitle1" fontWeight={700}>
            {isHousekeeping
              ? "Room Status Overview"
              : isReceptionist
                ? "Front Desk Overview"
                : "Aggregated System Statistics"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isHousekeeping
              ? "Rooms requiring your attention"
              : isReceptionist
                ? "Check-ins, check-outs and room availability"
                : "Key operational metrics at a glance"}
          </Typography>
        </Box>
        <Divider />
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
              {["Metric", "Value", "Details"].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row, i) => (
              <TableRow
                key={i}
                sx={{
                  "&:last-child td": { border: 0 },
                  "&:hover": { bgcolor: theme.palette.action.hover },
                  transition: "background 0.15s",
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    {row.icon}
                    <Typography variant="body2" fontWeight={500}>
                      {row.metric}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {row.value}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {row.detail}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DashboardPage;
