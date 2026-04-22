import express from "express";
import {
  createBooking,
  deleteBooking,
  getAllBooking,
  getAvailableRoomsController,
  getSingleBooking,
  updateBooking,
} from "../controllers/bookingController";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "../models/userModel";

const bookingRouter = express.Router();

bookingRouter.get(
  "/available-rooms",
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]),
  getAvailableRoomsController,
);
bookingRouter.post(
  "/",
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]),
  createBooking,
);
bookingRouter.get(
  "/",
  requireRole([
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.HOUSEKEEPING,
  ]),
  getAllBooking,
);
bookingRouter.get(
  "/:id",
  requireRole([
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.HOUSEKEEPING,
  ]),
  getSingleBooking,
);
bookingRouter.put(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]),
  updateBooking,
);
bookingRouter.delete(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  deleteBooking,
);

export default bookingRouter;