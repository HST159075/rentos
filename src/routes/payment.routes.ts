import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createPayment,
  getPaymentByBookingId,
} from "../controllers/payment.controller";
import { validateBody, createPaymentSchema } from "../middleware/validate";

const router = Router();

// All payment routes require authentication
router.use(requireAuth);

// API No.15 POST /api/payments — Process payment for a booking
router.post("/", validateBody(createPaymentSchema), createPayment);

// API No.16 GET /api/payments/:bookingId — Get payment details for a booking
router.get("/:bookingId", getPaymentByBookingId);

export default router;
