import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  getAdminDashboard,
  getOwnerDashboard,
  getRenterDashboard,
} from "../controllers/dashboard.controller";

const router = Router();

// All dashboard routes require authentication
router.use(requireAuth);

// API No.21 GET /api/dashboards/admin — Admin dashboard analytics
// Only 'admin' role can access this route
router.get("/admin", requireRole(["admin"]), getAdminDashboard);

// API No.22 GET /api/dashboards/owner — Owner dashboard analytics
// 'admin' or 'owner' role can access this route
router.get("/owner", requireRole(["admin", "owner"]), getOwnerDashboard);

// API No.23 GET /api/dashboards/renter — Renter dashboard analytics
// Any authenticated user can access this (renter is default, but owners/admins can also be renters)
router.get("/renter", getRenterDashboard);

export default router;
