import { Request, Response } from "express";
import { addRoomType } from "../../services/rooms/roomService";

export const createRoomType = async (req: Request, res: Response) => {
  try {
    const { name, basePrice, capacity, description, amenities } = req.body;
    const response = await addRoomType({
      name,
      basePrice,
      capacity,
      description,
      amenities,
    });
    res.status(200).json(response);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Room Type name already exists",
      });
    }
    res.status(500).json({ message: "Failed to add Room Type" });
  }
};
