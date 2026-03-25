import { RoomModel, RoomStatus } from "../models/rooms/roomModel";
import { BookingModel, BookingStatus } from "../models/bookingModel";
import { GuestModel } from "../models/guestModel";
import { InvoiceModel } from "../models/invoiceModel";

const getDateRanges = () => {
  const today = new Date();

  const startOfDay = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const endOfDay = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  const startOfMonth = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  return { today, startOfDay, endOfDay, startOfMonth, sevenDaysAgo };
};

export const getDashboardStatsService = async () => {
  const { startOfDay, endOfDay, startOfMonth, sevenDaysAgo } = getDateRanges();

  const [
    totalRooms,
    occupiedRooms,
    availableRooms,
    dirtyRooms,
    maintenanceRooms,
    totalGuests,
  ] = await Promise.all([
    RoomModel.countDocuments().lean(),
    RoomModel.countDocuments({ status: RoomStatus.OCCUPIED }).lean(),
    RoomModel.countDocuments({ status: RoomStatus.AVAILABLE }).lean(),
    RoomModel.countDocuments({ status: RoomStatus.DIRTY }).lean(),
    RoomModel.countDocuments({ status: RoomStatus.MAINTENANCE }).lean(),
    GuestModel.countDocuments().lean(),
  ]);

  const [
    todayCheckIns,
    todayCheckOuts,
    todayCheckInsList,
    todayCheckOutsList,
    monthlyRevenueAgg,
    last7DaysRevenueAgg,
  ] = await Promise.all([
    BookingModel.countDocuments({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: BookingStatus.CHECKED_IN,
    }).lean(),

    BookingModel.countDocuments({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
      status: BookingStatus.CHECKED_OUT,
    }).lean(),

    BookingModel.find({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: BookingStatus.CONFIRMED,
    })
      .populate("guest", "firstName lastName email phone")
      .populate("room", "roomNumber floor")
      .select("checkInDate totalAmount")
      .lean(),

    BookingModel.find({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
      status: BookingStatus.CHECKED_IN,
    })
      .populate("guest", "firstName lastName email phone")
      .populate("room", "roomNumber floor")
      .select("checkOutDate totalAmount")
      .lean(),

    InvoiceModel.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: "Paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmountDue" },
          count: { $sum: 1 },
        },
      },
    ]),

    InvoiceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmountDue" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const occupancyRate =
    totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
  const monthlyRevenue =
    monthlyRevenueAgg.length > 0 ? monthlyRevenueAgg[0].totalRevenue : 0;

  const revenueTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - i));
    date.setUTCHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split("T")[0];

    const found = last7DaysRevenueAgg.find((item) => item._id === dateStr);
    return {
      date: dateStr,
      amount: found ? found.total : 0,
    };
  });

  return {
    rooms: {
      total: totalRooms,
      occupied: occupiedRooms,
      available: availableRooms,
      dirty: dirtyRooms,
      maintenance: maintenanceRooms,
      occupancyRate: `${occupancyRate}%`,
    },
    guests: {
      total: totalGuests,
    },
    todayActivity: {
      checkIns: todayCheckIns,
      checkOuts: todayCheckOuts,
      arrivals: todayCheckInsList,
      departures: todayCheckOutsList,
    },
    financials: {
      monthlyRevenue: monthlyRevenue,
      revenueTrend: revenueTrend,
    },
  };
};
