import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  addRoomType,
  getRoomTypeById,
  findAllRoomTypes,
  removeRoomType,
  updateRoomTypeInfo,
} from "../../services/rooms/roomTypeService";

export const createRoomType = async (req: Request, res: Response) => {
  try {
    const roomTypeData = req.body;

    const response = await addRoomType(roomTypeData);
    res
      .status(201)
      .json({ data: response, message: "The Room Type Added Successfully" });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Room Type name already exists",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => {
        if (val.name === "CastError") {
          return `Invalid format: ${val.path} must be a number`;
        }
        return val.message;
      });
      return res.status(400).json({
        message: "Invalid Input",
        errors: messages,
      });
    }
    console.error("Server Error:", error);
    res.status(500).json({ message: "Failed to add Room Type" });
  }
};

export const getAllRoomType = async (req: Request, res: Response) => {
  try {
    const roomTypeInfo = await findAllRoomTypes();
    res.status(200).json({
      data: roomTypeInfo,
      message: "All room types fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getSingleRoomType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const roomTypeInfo = await getRoomTypeById(id);

    if (!roomTypeInfo)
      return res.status(404).json({ message: "Room Type not found" });

    res
      .status(200)
      .json({ data: roomTypeInfo, message: "Room Type Get Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateRoomType = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const response = await updateRoomTypeInfo(id, updateData);

    if (!response)
      return res.status(404).json({ message: "Room Type not found" });
    res
      .status(200)
      .json({ data: response, message: "The Room Type Updated Successfully" });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Room Type name already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => {
        if (val.name === "CastError") {
          return `Invalid format: ${val.path} must be a number`;
        }
        return val.message;
      });
      return res.status(400).json({
        message: "Invalid Input",
        errors: messages,
      });
    }
    console.error("Server Error:", error);
    res.status(500).json({ message: "Failed to Updated Room Type" });
  }
};

export const deleteRoomType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deletedRoom = await removeRoomType(id);

    if (!deletedRoom)
      return res.status(404).json({ message: "Room Type not found" });

    res
      .status(200)
      .json({ data: deletedRoom, message: "Room Type Deleted Successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
