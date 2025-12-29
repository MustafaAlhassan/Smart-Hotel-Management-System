import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  addService,
  findAllServices,
  getServiceById,
  removeService,
  updateServiceInfo,
} from "../services/serviceService";

const handleError = (error: any, res: Response) => {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Service's name already exists",
    });
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((val: any) => val.message);
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

export const createService = async (req: Request, res: Response) => {
  try {
    const serviceData = req.body;

    const service = await addService(serviceData);
    res
      .status(201)
      .json({ data: service, message: "The service Added Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await findAllServices();
    res.status(200).json({
      data: services,
      message: "All services fetched successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const getSingleService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const serviceInfo = await getServiceById(id);

    if (!serviceInfo)
      return res.status(404).json({ message: "Service not found" });

    res
      .status(200)
      .json({ data: serviceInfo, message: "Service Get Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const service = await updateServiceInfo(id, updateData);

    if (!service) return res.status(404).json({ message: "Service not found" });
    res
      .status(200)
      .json({ data: service, message: "The Service Updated Successfully" });
  } catch (error: any) {
    handleError(error, res);
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isIdInvalid(id, res)) return;

    const deletedService = await removeService(id);

    if (!deletedService)
      return res.status(404).json({ message: "Service not found" });

    res
      .status(200)
      .json({ data: deletedService, message: "Service Deleted Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};
