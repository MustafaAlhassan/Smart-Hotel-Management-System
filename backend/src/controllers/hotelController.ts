import { Request, Response } from "express";
import * as hotelService from "../services/hotelService";

export const getHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.getHotel();

    if (!hotel) {
      res.status(404).json({ message: "No hotel settings found." });
      return;
    }

    res.status(200).json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error." });
  }
};

export const createHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.createHotel(req.body);
    res.status(201).json({ message: "Hotel settings created successfully.", hotel });
  } catch (error: any) {
    const status = error.message.includes("already exist") ? 409 : 500;
    res.status(status).json({ message: error.message || "Internal server error." });
  }
};

export const updateHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await hotelService.updateHotel(req.body);
    res.status(200).json({ message: "Hotel settings updated successfully.", hotel: updated });
  } catch (error: any) {
    const status = error.message.includes("No hotel") ? 404 : 500;
    res.status(status).json({ message: error.message || "Internal server error." });
  }
};

export const deleteHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    await hotelService.deleteHotel();
    res.status(200).json({ message: "Hotel settings deleted successfully." });
  } catch (error: any) {
    const status = error.message.includes("No hotel") ? 404 : 500;
    res.status(status).json({ message: error.message || "Internal server error." });
  }
};