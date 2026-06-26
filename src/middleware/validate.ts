import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Reusable validation middleware
export const validateBody = (schema: z.ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

// ─── Listing Schemas ─────────────────────────────────────────────────────────

export const createListingSchema = z.object({
  title: z.string({ message: "Title is required" }).min(1, "Title cannot be empty").max(255),
  description: z.string({ message: "Description is required" }).min(1, "Description cannot be empty"),
  category: z.string({ message: "Category is required" }).min(1, "Category cannot be empty"),
  pricePerDay: z.coerce
    .number({ message: "Price per day must be a number" })
    .positive("Price per day must be a positive number"),
  depositAmount: z.coerce
    .number({ message: "Deposit amount must be a number" })
    .nonnegative("Deposit amount must be a non-negative number"),
});

export const updateListingSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  description: z.string().min(1, "Description cannot be empty").optional(),
  category: z.string().min(1, "Category cannot be empty").optional(),
  pricePerDay: z.coerce.number().positive("Price per day must be a positive number").optional(),
  depositAmount: z.coerce.number().nonnegative("Deposit amount must be a non-negative number").optional(),
  status: z.string().min(1, "Status cannot be empty").optional(),
});

// ─── Booking Schemas ──────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  listingId: z.string({ message: "Listing ID is required" }).min(1),
  startDate: z.string({ message: "Start date is required" }).refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format",
  }),
  endDate: z.string({ message: "End date is required" }).refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format",
  }),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "cancelled"], {
    message: "Status must be one of: approved, rejected, cancelled",
  }),
});

// ─── Payment Schemas ──────────────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  bookingId: z.string({ message: "Booking ID is required" }).min(1),
});

// ─── Review Schemas ───────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  bookingId: z.string({ message: "Booking ID is required" }).min(1),
  rating: z
    .number({ message: "Rating is required" })
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be greater than 5"),
  comment: z.string().optional(),
});

// ─── User Profile Schemas ──────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  image: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});
