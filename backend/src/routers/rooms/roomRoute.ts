// routers/rooms/roomRoute.ts
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
import { upload } from "../../middlewares/uploadMiddleware";

const roomRouter = express.Router();

roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getSingleRoom);

roomRouter.post(
  "/",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  upload.single("image"),
  createRoom,
);

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

roomRouter.put(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  upload.single("image"),
  updateRoom,
);

roomRouter.delete(
  "/:id",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  deleteRoom,
);

export default roomRouter;
