import express from "express";
import { createRoomType, deleteRoomType, updateRoomType } from "../../controllers/rooms/roomTypeController";

const roomTypeRouter = express.Router();

roomTypeRouter.post("/", createRoomType);
roomTypeRouter.put("/:id", updateRoomType);
roomTypeRouter.delete("/:id", deleteRoomType);

export default roomTypeRouter;
