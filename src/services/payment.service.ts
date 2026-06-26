import { prisma } from "../lib/prisma";

export const findBookingForPayment = async (bookingId: string) => {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: {
        select: { ownerId: true, depositAmount: true },
      },
    },
  });
};

export const findExistingPayment = async (bookingId: string) => {
  return prisma.payment.findFirst({
    where: { bookingId },
  });
};

export const create = async (data: {
  bookingId: string;
  amount: number;
  depositAmount: number;
}) => {
  return prisma.payment.create({
    data: {
      ...data,
      status: "completed",
    },
  });
};

export const findByBookingId = async (bookingId: string) => {
  return prisma.payment.findFirst({
    where: { bookingId },
    include: {
      booking: {
        select: {
          startDate: true,
          endDate: true,
          status: true,
          listing: {
            select: { title: true },
          },
          renter: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });
};
