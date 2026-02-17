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
} from "recharts";

import api from "../services/api";
import type { DashboardData } from "../types/types";

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
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress
          sx={{ color: theme.palette.primary.main }}
          size={60}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" variant="filled">
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

  const occupancyData = [
    {
      name: "Occupied",
      value: data.rooms.occupied,
      color: theme.palette.error.main,
    },
    {
      name: "Available",
      value: data.rooms.available,
      color: theme.palette.success.main,
    },
  ];

  const activityData = [
    {
      name: "Today",
      "Check-Ins": data.todayActivity.checkIns,
      "Check-Outs": data.todayActivity.checkOuts,
    },
  ];

  // بطاقة الإحصائيات بعرض ثابت وتصميم متوافق مع الثيم
  const StatCard = ({ title, value, icon, color }: any) => (
    <Paper
      elevation={0}
      sx={{
        width: 160,
        height: 160,
        borderRadius: 4,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows[4],
          borderColor: color,
        },
      }}
    >
      <Box sx={{ color: color, mb: 1.5, display: "flex" }}>{icon}</Box>
      <Typography
        variant="h4"
        fontWeight="800"
        sx={{ color: theme.palette.text.primary }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {title}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: "100%", boxSizing: "border-box" }}>
      <Box mb={4}>
        <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: -1 }}>
          Dashboard
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: theme.palette.text.secondary, opacity: 0.8 }}
        >
          Welcome back! Here's what's happening today.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
        <Grid container spacing={3} sx={{ maxWidth: "fit-content" }}>
          {[
            {
              title: "Total Rooms",
              value: data.rooms.total,
              icon: <MeetingRoom fontSize="large" />,
              color: theme.palette.primary.main,
            },
            {
              title: "Occupied",
              value: data.rooms.occupied,
              icon: <Hotel fontSize="large" />,
              color: theme.palette.error.main,
            },
            {
              title: "Occupancy",
              value: `${occupancyRate}%`,
              icon: <TrendingUp fontSize="large" />,
              color: theme.palette.warning.main,
            },
            {
              title: "Total Guests",
              value: data.guests.total,
              icon: <People fontSize="large" />,
              color: theme.palette.info.main,
            },
            {
              title: "Bookings",
              value: data.bookings?.total || 0,
              icon: <BookOnline fontSize="large" />,
              color: "#9c27b0",
            },
            {
              title: "Revenue MTD",
              value: `$${data.financials.monthlyRevenue}`,
              icon: <AttachMoney fontSize="large" />,
              color: theme.palette.success.main,
            },
          ].map((card, index) => (
            <Grid item key={index}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid
        container
        spacing={3}
        mb={4}
        justifyContent="center"
        alignItems="stretch"
      >
        {/* 1. Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: 450,
              borderRadius: 5,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={4}>
              <Typography variant="h5" fontWeight="800" sx={{ width: "100%" }}>
                Quick Actions
              </Typography>
            </Stack>
            <Stack spacing={3} sx={{ flexGrow: 1, justifyContent: "center" }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddCircleOutline />}
                sx={{
                  borderRadius: 3,
                  py: 2.5,
                  fontWeight: "bold",
                  fontSize: "1rem",
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
                  borderRadius: 3,
                  py: 2.5,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  borderWidth: 2,
                }}
              >
                Add New Guest
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* 2. Room Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: 450,
              borderRadius: 5,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h5" fontWeight="800" mb={4}>
              Room Distribution
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    innerRadius={80}
                    outerRadius={115}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* 3. Front Desk Activity */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: 450,
              borderRadius: 5,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h5" fontWeight="800" mb={4}>
              Front Desk Activity
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.palette.divider}
                  />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    allowDecimals={false}
                  />
                  <Tooltip cursor={{ fill: theme.palette.action.hover }} />
                  <Legend />
                  <Bar
                    dataKey="Check-Ins"
                    fill={theme.palette.primary.main}
                    radius={[6, 6, 0, 0]}
                    barSize={45}
                  />
                  <Bar
                    dataKey="Check-Outs"
                    fill={theme.palette.error.main}
                    radius={[6, 6, 0, 0]}
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 5,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          mb: 4,
        }}
      >
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold">
            Aggregated System Statistics
          </Typography>
        </Box>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Metric Category</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Count</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status / Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                m: "Total System Rooms",
                v: data.rooms.total,
                n: `${data.rooms.available} Currently Available`,
              },
              {
                m: "Active Database Guests",
                v: data.guests.total,
                n: "Lifetime registered profiles",
              },
              {
                m: "Current Monthly Revenue",
                v: `$${data.financials.monthlyRevenue}`,
                n: "Calculated since start of month",
              },
            ].map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.m}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{row.v}</TableCell>
                <TableCell sx={{ color: theme.palette.success.main }}>
                  {row.n}
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
