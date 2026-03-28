import { Request, Response } from "express";
import * as chatService from "../services/chatService";
import { UserRole } from "../models/userModel";

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message, role, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ response: "Message is required." });
    }

    if (!role) {
      return res.status(400).json({ response: "Role is required." });
    }

    // Validate that role is a known UserRole
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      return res.status(400).json({ response: "Invalid role provided." });
    }

    // Use sessionId from body, or fall back to a combination of role + IP
    // so even if the frontend doesn't send one, memory still works per-user
    const resolvedSessionId: string =
      sessionId ||
      `${role}-${req.ip}-${req.headers["user-agent"]?.slice(0, 20) ?? "unknown"}`;

    const aiResponse = await chatService.processChatWithAI(
      message,
      role as UserRole,
      resolvedSessionId
    );

    res.status(200).json({ response: aiResponse });
  } catch (error: any) {
    console.error("[ChatController] AI Error:", error);

    let errorMessage = "I'm having trouble accessing the system right now.";

    if (error.message === "API Key missing") {
      errorMessage = "Configuration error: AI service unavailable.";
    } else if (error.message?.includes("busy due to high demand")) {
      errorMessage = error.message;
    }

    res.status(500).json({ response: errorMessage });
  }
};

export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required." });
    }

    chatService.clearChatSession(sessionId);

    res.status(200).json({ message: "Chat history cleared successfully." });
  } catch (error: any) {
    console.error("[ChatController] Clear session error:", error);
    res.status(500).json({ message: "Failed to clear chat history." });
  }
};