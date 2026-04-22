import { Request, Response } from "express";
import { getDashboardStatsService } from "../services/dashboardService";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  } catch (error: any) {
    console.error("Dashboard Error:", error); // Log the actual error for debugging
    res.status(500).json({
      message: "An error occurred while fetching dashboard statistics.",
      error: error.message,
    });
  }
};