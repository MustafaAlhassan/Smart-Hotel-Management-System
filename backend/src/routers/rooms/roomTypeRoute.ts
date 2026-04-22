import express from "express";
import {
  createRoomType,
  deleteRoomType,
  getAllRoomTypes,
  getSingleRoomType,
  updateRoomType,
} from "../../controllers/rooms/roomTypeController";
import { requireRole } from "../../middlewares/requireRole";
import { UserRole } from "../../models/userModel";

const roomTypeRouter = express.Router();

roomTypeRouter.get("/", getAllRoomTypes);
roomTypeRouter.get("/:id", getSingleRoomType);

roomTypeRouter.post(
  "/",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  createRoomType,
);
roomTypeRouter.put(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  updateRoomType,
);
roomTypeRouter.delete(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  deleteRoomType,
);

export default roomTypeRouter;
