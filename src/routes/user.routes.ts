import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getProfile, updateProfile } from "../controllers/user.controller";
import { validateBody, updateProfileSchema } from "../middleware/validate";

const router = Router();

// All user profile routes require authentication
router.use(requireAuth);

// API No.19 GET /api/users/profile — Get user profile stats
router.get("/profile", getProfile);

// API No.20 PUT /api/users/profile — Update user profile
router.put("/profile", validateBody(updateProfileSchema), updateProfile);

export default router;
