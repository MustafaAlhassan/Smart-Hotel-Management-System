import { RoomModel, RoomStatus } from "../models/rooms/roomModel";
import { BookingModel } from "../models/bookingModel";
import { GuestModel } from "../models/guestModel";
import { InvoiceModel } from "../models/invoiceModel";

export const getDashboardStatsService = async () => {
  const today = new Date();

  const startOfDay = new Date(new Date(today).setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalRooms,
    occupiedRooms, 
    availableRooms,
    dirtyRooms,
    maintenanceRooms,
    totalGuests,
    todayCheckIns,
    todayCheckOuts,
    monthlyRevenue,
  ] = await Promise.all([
    RoomModel.countDocuments(),

    RoomModel.countDocuments({ status: RoomStatus.OCCUPIED }),

    RoomModel.countDocuments({ status: RoomStatus.AVAILABLE }),

    RoomModel.countDocuments({ status: RoomStatus.DIRTY }),

    RoomModel.countDocuments({ status: RoomStatus.MAINTENANCE }),

    GuestModel.countDocuments(),

    BookingModel.countDocuments({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: "CONFIRMED",
    }),

    BookingModel.countDocuments({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
      status: "CHECKED_IN",
    }),

    InvoiceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmountDue" },
        },
      },
    ]),
  ]);

  return {
    rooms: {
      total: totalRooms,
      occupied: occupiedRooms,
      available: availableRooms,
      dirty: dirtyRooms,
      maintenance: maintenanceRooms,
    },
    guests: {
      total: totalGuests,
    },
    todayActivity: {
      checkIns: todayCheckIns,
      checkOuts: todayCheckOuts,
    },
    financials: {
      monthlyRevenue:
        monthlyRevenue.length > 0 ? monthlyRevenue[0].totalRevenue : 0,
    },
  };
};
