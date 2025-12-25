import express from "express";
import {
  createRoomType,
  deleteRoomType,
  getAllRoomTypes,
  getSingleRoomType,
  updateRoomType,
} from "../../controllers/rooms/roomTypeController";

const roomTypeRouter = express.Router();

roomTypeRouter.post("/", createRoomType);
roomTypeRouter.get("/", getAllRoomTypes);
roomTypeRouter.get("/:id", getSingleRoomType);
roomTypeRouter.put("/:id", updateRoomType);
roomTypeRouter.delete("/:id", deleteRoomType);

export default roomTypeRouter;
