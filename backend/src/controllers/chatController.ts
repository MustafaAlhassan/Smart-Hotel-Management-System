import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RoomModel } from "../models/rooms/roomModel";
import dotenv from "dotenv";

dotenv.config();

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ response: "Server Error: API Key missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const availableRooms = await RoomModel.find({
      status: "Available",
    }).populate("roomType");

    const roomsContext =
      availableRooms.length > 0
        ? availableRooms
            .map((r) => {
              const details = r.roomType as any;

              return `- Room ${r.roomNumber} (${details.name}): Price $${details.basePrice}, Capacity: ${details.capacity} people, Amenities: ${details.amenities?.join(", ")}`;
            })
            .join("\n")
        : "No rooms currently available.";

    const hotelInfo = `
      - Hotel Name: Grand Hotel
      - Check-in: 1:00 PM
      - Check-out: 11:00 AM
    `;

    const prompt = `
      You are a smart receptionist at "Grand Hotel".
      
      --- ROOMS DATA (Real-time) ---
      ${roomsContext}
      
      --- GENERAL INFO ---
      ${hotelInfo}
      
      --- USER QUESTION ---
      "${message}"
      
      --- INSTRUCTIONS ---
      1. Answer strictly based on the provided ROOMS DATA.
      2. Mention the specific room number and price if recommending.
      3. Be concise and polite.
    `;

    console.log("📩 User Message:", message);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("🤖 AI Reply:", text);

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("❌ AI Error:", error);
    res
      .status(500)
      .json({ response: "I'm having trouble accessing the system right now." });
  }
};
