import express from "express";
import {
  handleChatMessage,
  clearChatHistory,
} from "../controllers/chatController";

const chatRouter = express.Router();

chatRouter.post("/", handleChatMessage);
chatRouter.post("/clear", clearChatHistory);

export default chatRouter;
