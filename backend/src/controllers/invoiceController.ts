import { Response } from "express";
import { AuthRequest } from "../middlewares/requireAuth";
import {
  createInvoice,
  getInvoiceByBookingId,
  getInvoiceById,
  updateInvoiceStatus,
  findAllInvoices,
  addServiceToInvoice as addServiceService,
  applyDiscountToInvoice,
  removeDiscountFromInvoice,
} from "../services/invoiceServices";

const handleError = (error: any, res: Response) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Server Error" });
};

export const generateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, services, discountCode } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const invoice = await createInvoice(
      bookingId,
      req.user._id.toString(),
      services,
      discountCode,
    );

    res.status(201).json(invoice);
  } catch (error: any) {
    if (error.message === "Invoice already exists for this booking") {
      return res.status(409).json({ message: error.message });
    }
    if (
      error.message.includes("invalid") ||
      error.message.includes("expired") ||
      error.message.includes("active") ||
      error.message.includes("usage limit") ||
      error.message.includes("minimum booking")
    ) {
      return res.status(400).json({ message: error.message });
    }
    handleError(error, res);
  }
};

export const getAllInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await findAllInvoices();
    res.status(200).json(invoices);
  } catch (error) {
    handleError(error, res);
  }
};

export const getInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await getInvoiceById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json(invoice);
  } catch (error) {
    handleError(error, res);
  }
};

export const addServiceToInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { serviceId, quantity } = req.body;

    if (!serviceId || !quantity) {
      return res
        .status(400)
        .json({ message: "Service ID and quantity are required" });
    }

    const updatedInvoice = await addServiceService(
      id,
      serviceId,
      Number(quantity),
    );
    res.status(200).json(updatedInvoice);
  } catch (error: any) {
    if (
      error.message === "Invoice not found" ||
      error.message === "Service not found"
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("paid invoice")) {
      return res.status(409).json({ message: error.message });
    }
    handleError(error, res);
  }
};

export const getBookingInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const invoice = await getInvoiceByBookingId(bookingId);
    if (!invoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found for this booking" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    handleError(error, res);
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;
    const updatedInvoice = await updateInvoiceStatus(
      id,
      paymentStatus,
      paymentMethod,
    );
    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(updatedInvoice);
  } catch (error) {
    handleError(error, res);
  }
};

export const applyDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { discountCode } = req.body;

    if (!discountCode) {
      return res.status(400).json({ message: "discountCode is required." });
    }

    const updatedInvoice = await applyDiscountToInvoice(id, discountCode);
    res.status(200).json({
      message: "Discount applied successfully.",
      invoice: updatedInvoice,
    });
  } catch (error: any) {
    if (error.message === "Invoice not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes("paid invoice") ||
      error.message.includes("already applied")
    ) {
      return res.status(409).json({ message: error.message });
    }
    // All discount validation errors (expired, inactive, limit, minimum) → 400
    return res.status(400).json({ message: error.message });
  }
};

export const removeDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedInvoice = await removeDiscountFromInvoice(id);
    res.status(200).json({
      message: "Discount removed successfully.",
      invoice: updatedInvoice,
    });
  } catch (error: any) {
    if (error.message === "Invoice not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes("paid invoice") ||
      error.message.includes("No discount")
    ) {
      return res.status(409).json({ message: error.message });
    }
    handleError(error, res);
  }
};
