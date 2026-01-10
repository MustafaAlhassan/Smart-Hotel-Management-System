import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  addBooking,
  cancelBookingService,
  findAllBooking,
  getBookingById,
  updateBookingInfo,
} from "../services/bookingService";

const handleError = (error: any, res: Response) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const fieldName =
      field === "idNumber"
        ? "ID Number"
        : field.charAt(0).toUpperCase() + field.slice(1);

    return res.status(409).json({
      message: `${fieldName} already exists`,
    });
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((val: any) => val.message);
    return res.status(400).json({
      message: "Invalid Input",
      errors: messages,
    });
  }

  if (error.message === "Room is already booked in these dates") {
    return res.status(409).json({
      message: error.message,
    });
  }

  if (error.message === "Booking not found") {
    return res.status(404).json({
      message: error.message,
    });
  }

  const badRequestErrors = [
    "Cannot check-out before the booking check-in time!",
    "Check-in date must be before check-out date",
    "Check-out date must be after check-in date",
  ];

  if (
    badRequestErrors.includes(error.message) ||
    error.message.startsWith("Cannot update booking with status")
  ) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Server Error:", error);
  res.status(500).json({ message: "Server Error" });
};

const isIdInvalid = (id: string, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return true;
  }
  return false;
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    const booking = await addBooking(bookingData);
    res
      .status(201)
      .json({ data: booking, message: "The Booking Create Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const getAllBooking = async (req: Request, res: Response) => {
  try {
    const booking = await findAllBooking();
    res.status(200).json({
      data: booking,
      message: "All booking fetched successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const getSingleBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const bookingInfo = await getBookingById(id);

    if (!bookingInfo)
      return res.status(404).json({ message: "Booking not found" });

    res
      .status(200)
      .json({ data: bookingInfo, message: "Booking Get Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const response = await updateBookingInfo(id, updateData);

    if (!response)
      return res.status(404).json({ message: "Booking not found" });
    res
      .status(200)
      .json({ data: response, message: "The Booking Updated Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const deletedBooking = await cancelBookingService(id);

    res.status(200).json({
      data: deletedBooking,
      message: "Booking Cancelled Successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};
