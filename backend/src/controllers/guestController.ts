import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  addGuest,
  findAllGuests,
  getGuestById,
  removeGuest,
  updateGuestInfo,
} from "../services/guestService";

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

  console.error("Server Error:", error.message);
  res.status(400).json({ message: error.message });
};

const isIdInvalid = (id: string, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return true;
  }
  return false;
};

export const createGuest = async (req: Request, res: Response) => {
  try {
    const guestData = req.body;

    const guest = await addGuest(guestData);
    res
      .status(201)
      .json({ data: guest, message: "The Guest Added Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const getAllGuests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await findAllGuests(page, limit, search);

    res.status(200).json({
      success: true,
      data: result.guests,
      pagination: {
        totalItems: result.total,
        currentPage: page,
        totalPages: result.totalPages,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSingleGuest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const guestsInfo = await getGuestById(id);

    if (!guestsInfo)
      return res.status(404).json({ message: "Guest not found" });

    res
      .status(200)
      .json({ data: guestsInfo, message: "Guest Get Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateGuest = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const guest = await updateGuestInfo(id, updateData);

    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res
      .status(200)
      .json({ data: guest, message: "The Guest Updated Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const deleteGuest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const deletedGuest = await removeGuest(id);

    if (!deletedGuest)
      return res.status(404).json({ message: "Guest not found" });

    res
      .status(200)
      .json({ data: deletedGuest, message: "Guest Deleted Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};
