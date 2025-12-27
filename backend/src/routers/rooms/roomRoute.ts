import express from "express";
import { createRoom, deleteRoom, getAllRoom, getSingleRoom, updateRoom } from "../../controllers/rooms/roomController";

const roomRouter = express.Router();

roomRouter.post("/", createRoom);
roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getSingleRoom);
roomRouter.put("/:id", updateRoom);
roomRouter.delete("/:id", deleteRoom);

export default roomRouter;
