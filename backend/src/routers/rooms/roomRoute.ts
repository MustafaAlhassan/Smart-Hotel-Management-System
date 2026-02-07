import express from "express";
import {
  changeRoomStatus,
  createRoom,
  deleteRoom,
  getAllRoom,
  getSingleRoom,
  updateRoom,
} from "../../controllers/rooms/roomController";
import { requireRole } from "../../middlewares/requireRole";
import { UserRole } from "../../models/userModel";

const roomRouter = express.Router();

roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getSingleRoom);

roomRouter.patch(
  "/:id/status",
  requireRole([
    UserRole.HOUSEKEEPING,
    UserRole.RECEPTIONIST,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]),
  changeRoomStatus,
);

roomRouter.post(
  "/",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  createRoom,
);

roomRouter.put(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  updateRoom,
);

roomRouter.delete("/:id", requireRole([UserRole.ADMIN, UserRole.MANAGER]), deleteRoom);

export default roomRouter;
