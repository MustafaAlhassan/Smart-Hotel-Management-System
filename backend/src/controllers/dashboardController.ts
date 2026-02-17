import { Request, Response } from "express";
import { getDashboardStatsService } from "../services/dashboardService";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStatsService();

    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({
      message: "Error happen when tring to brought it.",
      error: error.message,
    });
  }
};
