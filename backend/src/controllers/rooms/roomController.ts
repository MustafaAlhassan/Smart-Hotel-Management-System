import { Request, response, Response } from "express";
import mongoose from "mongoose";
import {
  addRoom,
  getRoomById,
  findAllRoom,
  removeRoom,
  updateRoomInfo,
} from "../../services/rooms/roomService";

const handleError = (error: any, res: Response) => {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Room Number already exists",
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
  res.status(500).json({ message: "Server Error" });
};

const isIdInvalid = (id: string, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return true;
  }
  return false;
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const roomData = req.body;

    const response = await addRoom(roomData);
    res
      .status(201)
      .json({ data: response, message: "The Room Added Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const getAllRoom = async (req: Request, res: Response) => {
  try {
    const room = await findAllRoom();
    res.status(200).json({
      data: room,
      message: "All room fetched successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const getSingleRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const roomInfo = await getRoomById(id);

    if (!roomInfo) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ data: roomInfo, message: "Room Get Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const updatedData = await updateRoomInfo(id, data);

    if (!updatedData)
      return res.status(404).json({ message: "Room not found" });
    res
      .status(200)
      .json({ data: updatedData, message: "The Room Updated Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const deletedRoom = await removeRoom(id);

    if (!deletedRoom)
      return res.status(404).json({ message: "Room not found" });

    res
      .status(200)
      .json({ data: deletedRoom, message: "Room Deleted Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};
