import type { Request, Response } from "express";
import * as paymentService from "../services/payment.service";

// API No.15 POST /api/payments — Process payment for a booking
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      res.status(400).json({ message: "Missing bookingId" });
      return;
    }

    // Check if booking exists and is approved
    const booking = await paymentService.findBookingForPayment(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Only the renter can pay
    if (booking.renterId !== userId) {
      res.status(403).json({ message: "Only the renter can make a payment" });
      return;
    }

    if (booking.status !== "approved") {
      res.status(400).json({ message: "Payment can only be made for approved bookings" });
      return;
    }

    // Prevent duplicate payment
    const existingPayment = await paymentService.findExistingPayment(bookingId);
    if (existingPayment) {
      res.status(409).json({ message: "Payment already exists for this booking" });
      return;
    }

    const payment = await paymentService.create({
      bookingId,
      amount: Number(booking.totalPrice),
      depositAmount: Number(booking.listing.depositAmount),
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.16 GET /api/payments/:bookingId — Get payment details for a booking
export const getPaymentByBookingId = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;
    const userId = req.user.id;

    const payment = await paymentService.findByBookingId(bookingId);

    if (!payment) {
      res.status(404).json({ message: "Payment not found for this booking" });
      return;
    }

    // Only renter or listing owner can view payment
    const booking = await paymentService.findBookingForPayment(bookingId);
    if (booking && booking.renterId !== userId && booking.listing.ownerId !== userId) {
      res.status(403).json({ message: "You are not authorized to view this payment" });
      return;
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
