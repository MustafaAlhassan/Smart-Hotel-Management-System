import express from "express";
import { createRoom } from "../controllers/roomController";

const roomRouter = express.Router();

roomRouter.post("/",createRoom);

export default roomRouter;