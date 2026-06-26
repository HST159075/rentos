import type { Request, Response } from "express";
import * as reviewService from "../services/review.service";

// API No.17 POST /api/reviews — Leave a review
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!bookingId) {
      res.status(400).json({ message: "Missing bookingId" });
      return;
    }

    if (rating === undefined || typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
      return;
    }

    if (comment !== undefined && typeof comment !== "string") {
      res.status(400).json({ message: "Comment must be a string" });
      return;
    }

    // Check if booking exists
    const booking = await reviewService.findBookingForReview(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Only the renter of the booking can leave a review
    if (booking.renterId !== reviewerId) {
      res.status(403).json({ message: "Only the renter of this booking can leave a review" });
      return;
    }

    // Booking must be approved or completed
    if (booking.status !== "approved" && booking.status !== "completed") {
      res.status(400).json({ message: "You can only review bookings that are approved or completed" });
      return;
    }

    // Prevent duplicate reviews for the same booking by the same reviewer
    const hasReviewed = booking.reviews.some((r) => r.reviewerId === reviewerId);
    if (hasReviewed) {
      res.status(409).json({ message: "You have already reviewed this booking" });
      return;
    }

    // Create the review
    const review = await reviewService.create({
      bookingId,
      reviewerId,
      revieweeId: booking.listing.ownerId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.18 GET /api/reviews/:userId — Get reviews for a user
export const getReviewsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }

    const reviews = await reviewService.findByReviewee(userId);

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
