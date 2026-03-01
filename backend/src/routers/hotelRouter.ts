import { Router } from "express";
import {
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "../models/userModel";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get(
  "/",
  getHotel,
);

router.post("/", requireAuth, requireRole([UserRole.ADMIN]), createHotel);

router.put(
  "/",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  updateHotel,
);

router.delete("/", requireAuth, requireRole([UserRole.ADMIN]), deleteHotel);

export default router;
