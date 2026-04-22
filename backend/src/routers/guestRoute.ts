import express from "express";
import {
  createGuest,
  deleteGuest,
  getAllGuests,
  getSingleGuest,
  searchGuest,
  updateGuest,
} from "../controllers/guestController";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "../models/userModel";

const guestRouter = express.Router();
const writeAccess = [UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST];

guestRouter.post("/", requireRole(writeAccess), createGuest);
guestRouter.get("/", requireRole(writeAccess), getAllGuests);
guestRouter.get("/search", requireRole(writeAccess), searchGuest);
guestRouter.get("/:id", requireRole(writeAccess), getSingleGuest);
guestRouter.put("/:id", requireRole(writeAccess), updateGuest);
guestRouter.delete(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  deleteGuest,
);

export default guestRouter;
