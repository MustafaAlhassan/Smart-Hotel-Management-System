import { Router } from "express";
import {
  generateInvoice,
  getAllInvoices,
  getBookingInvoice,
  getInvoice,
  updatePayment,
} from "../controllers/invoiceController";

const invoiceRouter = Router();

invoiceRouter.post("/", generateInvoice);
invoiceRouter.get("/", getAllInvoices);
invoiceRouter.get("/:id", getInvoice);
invoiceRouter.get("/booking/:bookingId", getBookingInvoice);
invoiceRouter.patch("/:id/payment", updatePayment);

export default invoiceRouter;
