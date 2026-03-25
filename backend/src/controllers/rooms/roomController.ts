import { Request, response, Response } from "express";
import mongoose from "mongoose";
import {
  addRoom,
  getRoomById,
  findAllRooms,
  removeRoom,
  updateRoomInfo,
  updateRoomStatus,
} from "../../services/rooms/roomService";
import { RoomModel, RoomStatus } from "../../models/rooms/roomModel";
import path from "path";
import fs from "fs";

const handleError = (error: any, res: Response) => {
  if (error.code === 11000) {
    return res.status(409).json({ message: "Room number already exists. Please choose a different room number." });
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((val: any) => {
      if (val.name === "CastError") {
        return `Invalid value for "${val.path}": expected a ${val.kind}`;
      }
      return val.message;
    });
    return res.status(400).json({ message: "Validation failed", errors: messages });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: `Invalid format for field "${error.path}": expected a valid ${error.kind}` });
  }

  const knownMessages = [
    "Room number already exists",
    "Room number is required",
    "Room type is required",
    "Floor number is required",
    "Floor must be a valid non-negative number",
    "Room number cannot be empty",
    "The selected room type does not exist",
    "The new Room Type is not found",
    "Invalid status",
    "Room is already marked as",
    "Occupied rooms can only be marked as",
    "Cannot delete room",
  ];

  const isKnown = knownMessages.some((msg) => error.message?.includes(msg));
  if (isKnown) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Unexpected Server Error:", error);
  res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
};

const isIdInvalid = (id: string, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: `"${id}" is not a valid room ID` });
    return true;
  }
  return false;
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const room = req.body;

    if (req.file) {
      room.image = req.file.path.replace(/\\/g, "/");
    }

    const newRoom = await addRoom(room);
    res.status(201).json(newRoom);
  } catch (error: any) {
    handleError(error, res);
  }
};

export const getAllRoom = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as RoomStatus;
    const rooms = await findAllRooms(status);
    res.status(200).json(rooms);
  } catch (error: any) {
    handleError(error, res);
  }
};

export const getSingleRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isIdInvalid(id, res)) return;
    const roomInfo = await getRoomById(id);
    res.status(200).json({ data: roomInfo, message: "Room retrieved successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (isIdInvalid(id, res)) return;

    if (req.file) {
      data.image = req.file.path.replace(/\\/g, "/");
      const existingRoom = await RoomModel.findById(id);

      if (existingRoom?.image) {
        try {
          const oldFileName = existingRoom.image.split(/[/\\]/).pop();
          if (oldFileName) {
            const oldImagePath = path.join(process.cwd(), "uploads", oldFileName);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        } catch (err) {
          console.error("Failed to delete old image file:", err);
        }
      }
    }

    const updatedData = await updateRoomInfo(id, data);
    if (!updatedData) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ data: updatedData, message: "Room updated successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const changeRoomStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isIdInvalid(id, res)) return;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!Object.values(RoomStatus).includes(status)) {
      return res.status(400).json({
        message: `Invalid status "${status}". Valid values are: ${Object.values(RoomStatus).join(", ")}`,
      });
    }

    const updatedRoom = await updateRoomStatus(id, status);
    res.status(200).json(updatedRoom);
  } catch (error: any) {
    handleError(error, res);
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isIdInvalid(id, res)) return;

    const deletedRoom = await removeRoom(id);
    if (!deletedRoom) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ data: deletedRoom, message: "Room deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};