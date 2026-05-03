// invoiceRouter.ts
import { Router } from "express";
import {
  generateInvoice,
  getAllInvoices,
  getBookingInvoice,
  getInvoice,
  updatePayment,
  addServiceToInvoice,
  applyDiscount,
  removeDiscount,
} from "../controllers/invoiceController";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "../models/userModel";

const invoiceRouter = Router();
const writeAccess = [UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST];

invoiceRouter.post("/", requireRole(writeAccess), generateInvoice);
invoiceRouter.get("/", requireRole(writeAccess), getAllInvoices);
invoiceRouter.get("/:id", requireRole(writeAccess), getInvoice);
invoiceRouter.get(
  "/booking/:bookingId",
  requireRole(writeAccess),
  getBookingInvoice,
);
invoiceRouter.patch("/:id/payment", requireRole(writeAccess), updatePayment);
invoiceRouter.patch(
  "/:id/services",
  requireRole(writeAccess),
  addServiceToInvoice,
);
invoiceRouter.patch("/:id/discount", requireRole(writeAccess), applyDiscount);
invoiceRouter.delete("/:id/discount", requireRole(writeAccess), removeDiscount);

export default invoiceRouter;
