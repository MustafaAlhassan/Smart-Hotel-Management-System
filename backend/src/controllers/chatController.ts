import { Request, Response } from "express";
import * as chatService from "../services/chatService";

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ response: "Message is required" });
    }
    const aiResponse = await chatService.processChatWithAI(message);

    res.status(200).json({ response: aiResponse });
  } catch (error: any) {
    console.error("AI Error:", error);

    const errorMessage = 
      error.message === "API Key missing" 
        ? "Configuration error: AI service unavailable." 
        : "I'm having trouble accessing the system right now.";

    res.status(500).json({ response: errorMessage });
  }
};