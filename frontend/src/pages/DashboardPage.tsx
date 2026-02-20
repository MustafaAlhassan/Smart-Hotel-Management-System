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
} from "@mui/material";
import {
  People,
  AttachMoney,
  AddCircleOutline,
  PersonAddAlt,
  MeetingRoom,
  Hotel,
  TrendingUp,
  BookOnline,
  EventAvailable,
  EventBusy,
  DonutLarge,
  CleaningServices, // Added for Dirty
  Handyman, // Added for Maintenance
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

const CARD_SIZE = 170;
const CHART_HEIGHT = 380;

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

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

  const occupancyRate =
    data.rooms.total > 0
      ? Math.round((data.rooms.occupied / data.rooms.total) * 100)
      : 0;
  const availableRate = 100 - occupancyRate;

  // Updated Pie Chart Data
  const occupancyData = [
    { name: "Occupied", value: data.rooms.occupied },
    { name: "Available", value: data.rooms.available },
    { name: "Dirty", value: data.rooms.dirty || 0 },
    { name: "Maintenance", value: data.rooms.maintenance || 0 },
  ];

  const activityData = [
    {
      name: "Today",
      "Check-Ins": data.todayActivity.checkIns,
      "Check-Outs": data.todayActivity.checkOuts,
    },
  ];

  const revenueBreakdown = [
    { name: "Rooms", value: Math.round(data.financials.monthlyRevenue * 0.6) },
    {
      name: "Services",
      value: Math.round(data.financials.monthlyRevenue * 0.25),
    },
    { name: "F&B", value: Math.round(data.financials.monthlyRevenue * 0.15) },
  ];

  const weeklyActivity = [
    { day: "Mon", checkIns: 4, checkOuts: 2 },
    { day: "Tue", checkIns: 6, checkOuts: 5 },
    { day: "Wed", checkIns: 3, checkOuts: 4 },
    { day: "Thu", checkIns: 8, checkOuts: 3 },
    { day: "Fri", checkIns: 10, checkOuts: 7 },
    { day: "Sat", checkIns: 9, checkOuts: 6 },
    {
      day: "Sun",
      checkIns: data.todayActivity.checkIns,
      checkOuts: data.todayActivity.checkOuts,
    },
  ];

  const statCards = [
    {
      title: "Total Rooms",
      value: data.rooms.total,
      icon: <MeetingRoom />,
      color: theme.palette.primary.main,
    },
    {
      title: "Occupied",
      value: data.rooms.occupied,
      icon: <Hotel />,
      color: theme.palette.error.main,
    },
    {
      title: "Available",
      value: data.rooms.available,
      icon: <DonutLarge />,
      color: theme.palette.success.main,
    },
    {
      title: "Dirty",
      value: data.rooms.dirty || 0,
      icon: <CleaningServices />,
      color: "#795548",
    },
    {
      title: "Maintenance",
      value: data.rooms.maintenance || 0,
      icon: <Handyman />,
      color: "#607d8b",
    },
    {
      title: "Occupancy",
      value: `${occupancyRate}%`,
      icon: <TrendingUp />,
      color: theme.palette.warning.main,
    },
    {
      title: "Guests",
      value: data.guests.total,
      icon: <People />,
      color: theme.palette.info.main,
    },
    {
      title: "Today's Check-Ins",
      value: data.todayActivity.checkIns,
      icon: <EventAvailable />,
      color: theme.palette.primary.main,
    },
    {
      title: "Today's Check-Outs",
      value: data.todayActivity.checkOuts,
      icon: <EventBusy />,
      color: theme.palette.error.main,
    },
  ];

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
          color: color,
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

  const tooltipStyle = {
    contentStyle: {
      borderRadius: 10,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
      fontSize: 12,
      backgroundColor: theme.palette.background.paper,
    },
  };

  // Updated Table Rows
  const tableRows = [
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
    },
    {
      metric: "Dirty Rooms",
      icon: <CleaningServices fontSize="small" sx={{ color: "#795548" }} />,
      value: data.rooms.dirty || 0,
      detail: "Requires housekeeping",
    },
    {
      metric: "Maintenance",
      icon: <Handyman fontSize="small" sx={{ color: "#607d8b" }} />,
      value: data.rooms.maintenance || 0,
      detail: "Out of service",
    },
    {
      metric: "Occupied Rooms",
      icon: <Hotel fontSize="small" sx={{ color: theme.palette.error.main }} />,
      value: data.rooms.occupied,
      detail: `${occupancyRate}% occupancy rate`,
    },
    {
      metric: "Check-Ins Today",
      icon: (
        <EventAvailable
          fontSize="small"
          sx={{ color: theme.palette.primary.main }}
        />
      ),
      value: data.todayActivity.checkIns,
      detail: "Guests arrived",
    },
    {
      metric: "Monthly Revenue",
      icon: (
        <AttachMoney
          fontSize="small"
          sx={{ color: theme.palette.success.main }}
        />
      ),
      value: `$${data.financials.monthlyRevenue.toLocaleString()}`,
      detail: "MTD Performance",
    },
  ];

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

      <Grid container spacing={2.5} mb={2.5} justifyContent={"center"}>
        <Grid item xs={12} md={4} sx={{ width: "300px" }}>
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
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={9} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4} sx={{ width: "300px" }}>
          <ChartCard title="Today's Front Desk">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barCategoryGap="50%">
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
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  {...tooltipStyle}
                  cursor={{ fill: theme.palette.action.hover }}
                />
                <Legend iconType="circle" iconSize={9} />
                <Bar
                  dataKey="Check-Ins"
                  fill={theme.palette.primary.main}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="Check-Outs"
                  fill={theme.palette.error.main}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4} sx={{ width: "300px" }}>
          <ChartCard title="Revenue Breakdown">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBreakdown} barCategoryGap="50%">
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
                />
                <Tooltip
                  {...tooltipStyle}
                  cursor={{ fill: theme.palette.action.hover }}
                />
                <Bar
                  dataKey="value"
                  name="Revenue ($)"
                  fill={theme.palette.success.main}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mb={2.5} justifyContent={"center"}>
        <Grid item xs={12} md={8} sx={{ width: "500px" }}>
          <ChartCard title="Weekly Check-In / Check-Out Trend">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={theme.palette.primary.main}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={theme.palette.primary.main}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={theme.palette.error.main}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={theme.palette.error.main}
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
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={9} />
                <Area
                  type="monotone"
                  dataKey="checkIns"
                  name="Check-Ins"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill="url(#ciGrad)"
                  dot={{ r: 4, fill: theme.palette.primary.main }}
                />
                <Area
                  type="monotone"
                  dataKey="checkOuts"
                  name="Check-Outs"
                  stroke={theme.palette.error.main}
                  strokeWidth={2}
                  fill="url(#coGrad)"
                  dot={{ r: 4, fill: theme.palette.error.main }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4} sx={{ width: "500px" }}>
          <ChartCard title="Quick Actions">
            <Stack spacing={2.5} height="100%" justifyContent="center">
              <Button
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
            Aggregated System Statistics
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Key operational metrics at a glance
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
