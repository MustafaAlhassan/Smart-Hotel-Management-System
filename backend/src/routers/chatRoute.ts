import express from "express";
import { handleChatMessage } from "../controllers/chatController";

const chatRouter = express.Router();

chatRouter.post("/", handleChatMessage);

export default chatRouter;