import express from "express";
import {
  createRoomType,
  deleteRoomType,
  getAllRoomType,
  getSingleRoomType,
  updateRoomType,
} from "../../controllers/rooms/roomTypeController";

const roomTypeRouter = express.Router();

roomTypeRouter.post("/", createRoomType);
roomTypeRouter.get("/", getAllRoomType);
roomTypeRouter.get("/:id", getSingleRoomType);
roomTypeRouter.put("/:id", updateRoomType);
roomTypeRouter.delete("/:id", deleteRoomType);

export default roomTypeRouter;
