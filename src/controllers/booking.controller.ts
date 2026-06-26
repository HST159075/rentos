import type { Request, Response } from "express";
import * as bookingService from "../services/booking.service";

// API No.11 POST /api/bookings  — Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId, startDate, endDate } = req.body;
    const renterId = req.user.id;

    if (!listingId || !startDate || !endDate) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      res.status(400).json({ message: "End date must be after start date" });
      return;
    }

    // Check if listing exists
    const listing = await bookingService.findListingForBooking(listingId);

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.ownerId === renterId) {
      res.status(400).json({ message: "You cannot book your own listing" });
      return;
    }

    // Check for overlapping bookings
    const overlap = await bookingService.checkOverlap(listingId, start, end);

    if (overlap) {
      res.status(409).json({ message: "Listing is already booked for these dates" });
      return;
    }

    // Calculate total price based on days
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = Number(listing.pricePerDay) * days;

    const booking = await bookingService.create({
      listingId,
      renterId,
      startDate: start,
      endDate: end,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.12 GET /api/bookings  — Get all bookings for the current user (paginated)
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { bookings, total } = await bookingService.findAllByUser(userId, page, limit);

    res.status(200).json({
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.13 GET /api/bookings/:id  — Get single booking details
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    const booking = await bookingService.findById(id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Ensure the user is either the renter or the owner of the listing
    if (booking.renterId !== userId && booking.listing.ownerId !== userId) {
      res.status(403).json({ message: "You are not authorized to view this booking" });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.14 PATCH /api/bookings/:id/status  — Approve/Reject/Cancel a booking
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status || !["approved", "rejected", "cancelled"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const booking = await bookingService.findWithListing(id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Owner can approve/reject, Renter can cancel
    if (status === "approved" || status === "rejected") {
      if (booking.listing.ownerId !== userId) {
        res.status(403).json({ message: "Only the listing owner can approve or reject" });
        return;
      }
    }

    if (status === "cancelled") {
      if (booking.renterId !== userId) {
        res.status(403).json({ message: "Only the renter can cancel the booking" });
        return;
      }
    }

    const updatedBooking = await bookingService.updateStatus(id, status);

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
