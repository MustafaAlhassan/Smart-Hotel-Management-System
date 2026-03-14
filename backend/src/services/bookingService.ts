import { Types } from "mongoose";
import { BookingModel, IBooking } from "../models/bookingModel";
import {
  markRoomAsOccupied,
  markRoomAsDirty,
  markRoomAsClean,
} from "./rooms/roomService";
import { GuestModel } from "../models/guestModel";
import { RoomModel, RoomStatus } from "../models/rooms/roomModel";

export const checkRoomAvailability = async (
  roomId: string | Types.ObjectId,
  checkIn: Date | string,
  checkOut: Date | string,
  excludeBookingId?: string,
): Promise<boolean> => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const query: any = {
    room: roomId,
    status: { $nin: ["Cancelled", "Checked-Out"] },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBooking = await BookingModel.findOne(query);

  return !existingBooking;
};

export const getAvailableRooms = async (
  checkIn: Date | string,
  checkOut: Date | string,
) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    throw new Error("Check-out date must be after check-in date");
  }

  const overlappingBookings = await BookingModel.find({
    status: { $nin: ["Cancelled", "Checked-Out"] },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  }).select("room");

  const occupiedRoomIds = overlappingBookings.map((b) => b.room);

  return await RoomModel.find({
    status: { $ne: RoomStatus.MAINTENANCE },
    _id: { $nin: occupiedRoomIds },
  }).populate({
    path: "roomType",
    select: "name basePrice capacity",
  });
};

export const addBooking = async (
  data: Omit<IBooking, "_id" | "createdAt" | "updatedAt">,
) => {
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);

  if (checkIn.getTime() >= checkOut.getTime()) {
    throw new Error("Check-out date must be after check-in date");
  }
  const isAvailable = await checkRoomAvailability(
    data.room,
    data.checkInDate,
    data.checkOutDate,
  );

  if (!isAvailable) throw new Error("Room is already booked in these dates");

  const newBooking = new BookingModel(data);
  await newBooking.save();

  await GuestModel.findByIdAndUpdate(data.guest, { $inc: { bookingCount: 1 } });

  return newBooking.populate([
    { path: "guest", select: "firstName lastName email phoneNumber address" },
    {
      path: "room",
      select: "roomNumber roomType status floor",
      populate: {
        path: "roomType",
        select: "name basePrice capacity",
      },
    },
  ]);
};

export const getBookingById = async (id: string) => {
  return await BookingModel.findById(id).populate([
    { path: "guest", select: "firstName lastName email phoneNumber address" },
    {
      path: "room",
      select: "roomNumber roomType status floor",
      populate: {
        path: "roomType",
        select: "name basePrice capacity",
      },
    },
  ]);
};

export const findAllBooking = async () => {
  return await BookingModel.find().populate([
    { path: "guest", select: "firstName lastName email phoneNumber address" },
    {
      path: "room",
      select: "roomNumber roomType status floor",
      populate: {
        path: "roomType",
        select: "name basePrice capacity",
      },
    },
  ]);
};

export const updateBookingInfo = async (
  id: string,
  updateData: Partial<IBooking>,
) => {
  const currentBooking = await BookingModel.findById(id);
  if (!currentBooking) throw new Error("Booking not found");

  if (
    currentBooking.status === "Cancelled" ||
    currentBooking.status === "Checked-Out"
  ) {
    throw new Error(
      `Cannot update booking with status '${currentBooking.status}'. Create a new booking instead.`,
    );
  }
  const now = new Date();

  if (updateData.status === "Checked-In") {
    const scheduledCheckIn = new Date(currentBooking.checkInDate);
    if (now.getTime() < scheduledCheckIn.getTime()) {
      updateData.checkInDate = now;
    }
    await markRoomAsOccupied(currentBooking.room.toString());
  }

  if (updateData.status === "Checked-Out") {
    const scheduledCheckOut = new Date(currentBooking.checkOutDate);
    const actualCheckIn = updateData.checkInDate
      ? new Date(updateData.checkInDate)
      : new Date(currentBooking.checkInDate);
    if (now.getTime() < actualCheckIn.getTime()) {
      throw new Error("Cannot check-out before the booking check-in time!");
    }
    if (now.getTime() < scheduledCheckOut.getTime()) {
      updateData.checkOutDate = now;
    }

    await markRoomAsDirty(currentBooking.room.toString());
  }

  const finalCheckIn = updateData.checkInDate
    ? new Date(updateData.checkInDate)
    : new Date(currentBooking.checkInDate);

  const finalCheckOut = updateData.checkOutDate
    ? new Date(updateData.checkOutDate)
    : new Date(currentBooking.checkOutDate);

  if (finalCheckIn.getTime() >= finalCheckOut.getTime()) {
    throw new Error("Check-out date must be after check-in date");
  }

  if (updateData.room || updateData.checkInDate || updateData.checkOutDate) {
    const roomId = updateData.room || currentBooking.room;
    const checkIn = updateData.checkInDate || currentBooking.checkInDate;
    const checkOut = updateData.checkOutDate || currentBooking.checkOutDate;

    const isAvailable = await checkRoomAvailability(
      roomId,
      checkIn,
      checkOut,
      id,
    );

    if (!isAvailable) {
      throw new Error("Room is already booked in these dates");
    }
  }

  return await BookingModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "guest", select: "firstName lastName email phoneNumber address" },
    {
      path: "room",
      select: "roomNumber roomType status floor",
      populate: {
        path: "roomType",
        select: "name basePrice capacity",
      },
    },
  ]);
};

export const cancelBookingService = async (id: string) => {
  const booking = await BookingModel.findByIdAndUpdate(
    id,
    { status: "Cancelled" },
    { new: true },
  );

  if (!booking) throw new Error("Booking not found");

  await markRoomAsClean(booking.room.toString());

  await GuestModel.findByIdAndUpdate(booking.guest, {
    $inc: { bookingCount: -1 },
  });

  return booking.populate([
    { path: "guest", select: "firstName lastName email phoneNumber address" },
    {
      path: "room",
      select: "roomNumber roomType status floor",
      populate: {
        path: "roomType",
        select: "name basePrice capacity",
      },
    },
  ]);
};