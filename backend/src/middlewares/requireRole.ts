import { Response, NextFunction } from "express";
import { AuthRequest } from "./requireAuth";
import { UserRole } from "../models/userModel";

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Access Denied: You do not have permission to perform this action",
      });
    }
    next();
  };
};
