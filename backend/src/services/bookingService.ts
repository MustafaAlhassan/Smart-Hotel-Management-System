import { BookingModel, IBooking } from "../models/bookingModel";

const checkAvailability = (data) => {
    
}

export const addBooking = async (
  data: Omit<IBooking, "_id" | "createdAt" | "updatedAt">
) => {
    checkAvailability(data);
  const newBooking = new BookingModel(data);
  await newBooking.save();
  return newBooking;
};