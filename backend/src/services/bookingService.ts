import { BookingModel, IBooking } from "../models/bookingModel";

export const checkRoomAvailability = async (roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> => {

  const existingBooking = await BookingModel.findOne({
    room: roomId,
    status: { $nin: ['Cancelled', 'Checked-Out'] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn }
  });

  return !existingBooking; 
};

export const addBooking = async (
  data: Omit<IBooking, "_id" | "createdAt" | "updatedAt">
) => {
  
  const newBooking = new BookingModel(data);
  await newBooking.save();
  return newBooking;
};