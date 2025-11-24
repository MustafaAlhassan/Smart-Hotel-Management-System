import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "You Should Login First" });
  }
  const token = authorization.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Bearer token not found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const user = await UserModel.findOne({ _id: decoded.id }).select(
      "_id role"
    );

    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};
