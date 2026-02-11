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
    const { roomNumber, roomType, floor, status } = req.body;

    let imagePath = "";
    if (req.file) {
      imagePath = req.file.path;
    }

    const newRoom = await RoomModel.create({
      roomNumber,
      roomType,
      floor: Number(floor),
      status,
      image: imagePath,
    });

    res.status(201).json(newRoom);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllRoom = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as RoomStatus;
    const rooms = await findAllRooms(status);
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
    const { id } = req.params;
    const data = { ...req.body };

    if (isIdInvalid(id, res)) return;

    if (req.file) {
      data.image = req.file.path;
      const existingRoom = await RoomModel.findById(id);

      if (existingRoom && existingRoom.image) {
        try {
          const oldFileName = existingRoom.image.split(/[/\\]/).pop();

          if (oldFileName) {
            const oldImagePath = path.join(
              process.cwd(),
              "uploads",
              oldFileName,
            );

            console.log("📍 Trying to delete:", oldImagePath);

            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log("✅ Deleted successfully.");
            } else {
              console.log(
                "⚠️ File mismatch: Database says file exists, but disk says no.",
              );
            }
          }
        } catch (err) {
          console.error("❌ Error deleting old image:", err);
        }
      }
    }
    const updatedData = await updateRoomInfo(id, data);

    if (!updatedData)
      return res.status(404).json({ message: "Room not found" });

    res
      .status(200)
      .json({ data: updatedData, message: "Room Updated Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const changeRoomStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(RoomStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid room status" });
    }

    const updatedRoom = await updateRoomStatus(id, status);
    res.status(200).json(updatedRoom);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
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
