import { Request, Response } from "express";
import {
  createInvoice,
  getInvoiceByBookingId,
  getInvoiceById,
  updateInvoiceStatus,
  findAllInvoices,
} from "../services/invoiceServices";
import { ServiceModel } from "../models/serviceModel";

import { InvoiceModel } from "../models/invoiceModel";

const handleError = (error: any, res: Response) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Server Error" });
};

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const { bookingId, services } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const invoice = await createInvoice(bookingId, services);
    res.status(201).json(invoice);
  } catch (error: any) {
    if (error.message === "Invoice already exists for this booking") {
      return res.status(409).json({ message: error.message });
    }
    handleError(error, res);
  }
};

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await findAllInvoices();
    res.status(200).json(invoices);
  } catch (error) {
    handleError(error, res);
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await getInvoiceById(id);

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json(invoice);
  } catch (error) {
    handleError(error, res);
  }
};

export const addServiceToInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { serviceId, quantity } = req.body;

    if (!serviceId || !quantity) {
      return res
        .status(400)
        .json({ message: "Service ID and quantity are required" });
    }

    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const serviceDetails = await ServiceModel.findById(serviceId);

    if (!serviceDetails) {
      return res.status(404).json({ message: "Service not found in database" });
    }

    const price = serviceDetails.price;
    const itemTotal = price * quantity;

    invoice.usedServices.push({
      service: serviceId,
      name: serviceDetails.name,
      quantity: quantity,
      price: price,
      total: itemTotal,
    });

    invoice.totalServiceCharge += itemTotal;
    invoice.totalAmountDue += itemTotal;

    await invoice.save();

    res.status(200).json(invoice);
  } catch (error) {
    handleError(error, res);
  }
};

export const getBookingInvoice = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const invoice = await getInvoiceByBookingId(bookingId);

    if (!invoice)
      return res
        .status(404)
        .json({ message: "Invoice not found for this booking" });

    res.status(200).json(invoice);
  } catch (error) {
    handleError(error, res);
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    const updatedInvoice = await updateInvoiceStatus(
      id,
      paymentStatus,
      paymentMethod,
    );

    if (!updatedInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json(updatedInvoice);
  } catch (error) {
    handleError(error, res);
  }
};
