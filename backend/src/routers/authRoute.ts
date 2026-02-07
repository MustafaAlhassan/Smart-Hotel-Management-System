// authRoute.ts
import express from "express";
import {
  loginUser,
  signupUser,
  createUser,
  updateUserRole,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  resetUserPassword,
} from "../controllers/authController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "../models/userModel";

const userRoutes = express.Router();

userRoutes.post("/login", loginUser);
userRoutes.post("/signup", signupUser);

userRoutes.post(
  "/create-user",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  createUser,
);

userRoutes.get(
  "/",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  getAllUsers,
);

userRoutes.get(
  "/:id",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  getUserById,
);

userRoutes.patch(
  "/:id/role",
  requireAuth,
  requireRole([UserRole.ADMIN]),
  updateUserRole,
);

userRoutes.delete(
  "/:id",
  requireAuth,
  requireRole([UserRole.ADMIN]),
  deleteUser,
);

userRoutes.put(
  "/:id",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  updateUser,
);

userRoutes.patch(
  "/:id/reset-password",
  requireAuth,
  requireRole([UserRole.ADMIN]),
  resetUserPassword,
);

export default userRoutes;
