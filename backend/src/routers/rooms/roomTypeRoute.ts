import express from "express";
import { createRoomType } from "../../controllers/rooms/roomTypeController";

const roomTypeRouter = express.Router();

roomTypeRouter.post("/", createRoomType);

export default roomTypeRouter;
