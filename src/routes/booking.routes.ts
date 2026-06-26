import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/booking.controller";
import { validateBody, createBookingSchema, updateBookingStatusSchema } from "../middleware/validate";

const router = Router();

// All booking routes require authentication
router.use(requireAuth);

// API No.11 POST /api/bookings  — Create a new booking
router.post("/", validateBody(createBookingSchema), createBooking);

// API No.12 GET /api/bookings  — Get all bookings for the current user
router.get("/", getBookings);

// API No.13 GET /api/bookings/:id  — Get single booking details
router.get("/:id", getBookingById);

// API No.14 PATCH /api/bookings/:id/status  — Approve/Reject/Cancel a booking
router.patch("/:id/status", validateBody(updateBookingStatusSchema), updateBookingStatus);

export default router;
