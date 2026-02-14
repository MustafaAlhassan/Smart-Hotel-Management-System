// src/services/dashboardService.ts
import api from "./api"; // Import your existing axios instance from image_cdabe1.png
import { DashboardData } from "../types/types"; // Use your central types file

export const fetchDashboardStats = async (): Promise<DashboardData> => {
  // Use 'api' instead of 'axios' so it sends your Token automatically
  const response = await api.get("/dashboard/stats");
  return response.data;
};
