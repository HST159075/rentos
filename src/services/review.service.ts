import { prisma } from "../lib/prisma";

// API No.17 POST /api/reviews — Leave a review
export const findBookingForReview = async (bookingId: string) => {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: {
        select: { ownerId: true },
      },
      reviews: {
        select: { id: true, reviewerId: true },
      },
    },
  });
};

// API No.17 POST /api/reviews — Leave a review
export const create = async (data: {
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}) => {
  return prisma.review.create({
    data,
  });
};

// API No.18 GET /api/reviews/:userId — Get reviews for a user
export const findByReviewee = async (revieweeId: string) => {
  return prisma.review.findMany({
    where: { revieweeId },
    include: {
      reviewer: {
        select: { id: true, name: true, image: true },
      },
      booking: {
        select: {
          id: true,
          listing: {
            select: { title: true },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  });
};
