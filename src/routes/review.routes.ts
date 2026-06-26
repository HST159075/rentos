import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createReview, getReviewsByUserId } from "../controllers/review.controller";
import { validateBody, createReviewSchema } from "../middleware/validate";

const router = Router();

// API No.17 POST /api/reviews — Leave a review
// Requires authentication (specifically the renter of the booking)
router.post("/", requireAuth, validateBody(createReviewSchema), createReview);

// API No.18 GET /api/reviews/:userId — Get reviews for a user
// Public route
router.get("/:userId", getReviewsByUserId);

export default router;
