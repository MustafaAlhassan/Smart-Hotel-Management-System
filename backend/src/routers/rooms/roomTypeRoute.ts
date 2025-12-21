import express from "express";
import { createRoomType, deleteRoomType } from "../../controllers/rooms/roomTypeController";

const roomTypeRouter = express.Router();

roomTypeRouter.post("/", createRoomType);
roomTypeRouter.delete("/:id", deleteRoomType);

export default roomTypeRouter;
