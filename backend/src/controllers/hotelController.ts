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

export const addDiscountCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.addDiscountCode(req.body);
    res.status(201).json({ message: "Discount code added successfully.", discountCodes: hotel.discountCodes });
  } catch (error: any) {
    const status = error.message.includes("already exists") ? 409
      : error.message.includes("No hotel") ? 404
      : 400;
    res.status(status).json({ message: error.message || "Internal server error." });
  }
};

export const updateDiscountCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.updateDiscountCode(req.params.code, req.body);
    res.status(200).json({ message: "Discount code updated successfully.", discountCodes: hotel.discountCodes });
  } catch (error: any) {
    const status = error.message.includes("not found") ? 404
      : error.message.includes("No hotel") ? 404
      : 400;
    res.status(status).json({ message: error.message || "Internal server error." });
  }
};

export const deleteDiscountCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.deleteDiscountCode(req.params.code);
    res.status(200).json({ message: "Discount code deleted successfully.", discountCodes: hotel.discountCodes });
  } catch (error: any) {
    const status = error.message.includes("not found") ? 404
      : error.message.includes("No hotel") ? 404
      : 500;
    res.status(status).json({ message: error.message || "Internal server error." });
  }
};

export const validateDiscountCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { bookingAmount } = req.body;

    if (bookingAmount == null || isNaN(Number(bookingAmount))) {
      res.status(400).json({ message: "bookingAmount is required and must be a number." });
      return;
    }

    const { discountCode, discountAmount } = await hotelService.validateDiscountCode(
      code,
      Number(bookingAmount),
    );

    res.status(200).json({
      message: "Discount code is valid.",
      discountCode: {
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        description: discountCode.description,
      },
      discountAmount,
    });
  } catch (error: any) {
    const status =
      error.message.includes("invalid") ? 404
      : error.message.includes("not found") ? 404
      : 400;
    res.status(status).json({ message: error.message || "Internal server error." });
  }
};