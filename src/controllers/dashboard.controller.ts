import type { Request, Response } from "express";
import { getAdminStats, getOwnerStats, getRenterStats } from "../services/dashboard.service";

// API No.21 GET /api/dashboards/admin — Admin dashboard analytics
export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getAdminStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.22 GET /api/dashboards/owner — Owner dashboard analytics
export const getOwnerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const stats = await getOwnerStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching owner dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.23 GET /api/dashboards/renter — Renter dashboard analytics
export const getRenterDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const stats = await getRenterStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching renter dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
