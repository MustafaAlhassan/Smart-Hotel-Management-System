export interface DashboardData {
  rooms: {
    total: number;
    occupied: number;
    available: number;
    maintenance?: number;
  };
  guests: {
    total: number;
  };
  todayActivity: {
    checkIns: number;
    checkOuts: number;
    pendingArrivals?: number;
  };
  financials: {
    monthlyRevenue: number;
  };
  recentBookings?: {
    id: string;
    guest: string;
    room: string;
    status: "Confirmed" | "Checked In" | "Pending";
  }[];
}
