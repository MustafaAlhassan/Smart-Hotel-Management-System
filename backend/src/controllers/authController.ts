import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const createToken = (id: string, role: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "300d" });
};

export const loginUser = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  try {
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    const token = createToken(user._id.toString(), user.role);
    res.status(200).json({ token, username: user.username, role: user.role });
    
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Error, please try later" });
  }
};
