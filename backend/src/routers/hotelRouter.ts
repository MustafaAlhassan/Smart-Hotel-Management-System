import { Router } from "express";
import {
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  addDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  validateDiscountCode,
} from "../controllers/hotelController";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "../models/userModel";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/", getHotel);
router.post("/", requireAuth, requireRole([UserRole.ADMIN]), createHotel);
router.put(
  "/",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  updateHotel,
);
router.delete("/", requireAuth, requireRole([UserRole.ADMIN]), deleteHotel);

router.post(
  "/discounts",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  addDiscountCode,
);

router.put(
  "/discounts/:code",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  updateDiscountCode,
);

router.delete(
  "/discounts/:code",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  deleteDiscountCode,
);

router.post(
  "/discounts/:code/validate",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.HOUSEKEEPING]),
  validateDiscountCode,
);

export default router;
