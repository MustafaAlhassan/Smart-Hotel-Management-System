import { Response } from "express";
import { AuthRequest } from "../middlewares/requireAuth";
import { findUserProfile } from "../services/userService";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await findUserProfile(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
