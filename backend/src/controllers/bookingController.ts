import { Request, Response } from "express";
import mongoose from "mongoose";
import { addBooking } from "../services/bookingService";

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

  if (
    error.message === "Room is already booked" ||
    error.message.includes("Check-out")
  ) {
    return res.status(409).json({
      message: error.message,
    });
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
