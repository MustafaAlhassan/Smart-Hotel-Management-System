import { Request, Response } from "express";
import { RoomModel } from "../models/rooms/roomModel";
import { BookingModel } from "../models/bookingModel";
import { GuestModel } from "../models/guestModel";
import { InvoiceModel } from "../models/invoiceModel";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalRooms,
      occupiedRooms,
      totalGuests,
      todayCheckIns,
      todayCheckOuts,
      monthlyRevenue,
    ] = await Promise.all([
      RoomModel.countDocuments(),

      BookingModel.countDocuments({ status: "CHECKED_IN" }),

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
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        available: totalRooms - occupiedRooms,
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
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
