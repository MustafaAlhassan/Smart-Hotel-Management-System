import { Types } from "mongoose";
import { BookingModel, IBooking } from "../models/bookingModel";

export const checkRoomAvailability = async (
  roomId: string | Types.ObjectId,
  checkIn: Date | string,
  checkOut: Date | string
): Promise<boolean> => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const existingBooking = await BookingModel.findOne({
    room: roomId,
    status: { $nin: ["Cancelled", "Checked-Out"] },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  });

  if (existingBooking) {
    return false;
  }
  return true;
};

export const addBooking = async (
  data: Omit<IBooking, "_id" | "createdAt" | "updatedAt">
) => {
  const isAvailable = await checkRoomAvailability(
    data.room,
    data.checkInDate,
    data.checkOutDate
  );

  if (!isAvailable) throw new Error("Room is already booked in these dates");

  const newBooking = new BookingModel(data);
  await newBooking.save();
  return newBooking.populate([
    { path: "guest", select: "firstName lastName email phoneNumber address" },
    {
      path: "room",
      populate: {
        path: "roomType",
        select: "name basePrice capacity",
      },
    },
  ]);
};
