import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "../models/userModel";

const dashboardRouter = Router();

dashboardRouter.get(
  "/stats",
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  getDashboardStats,
);

export default dashboardRouter;
