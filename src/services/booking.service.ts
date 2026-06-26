import { prisma } from "../lib/prisma";

export const findListingForBooking = async (listingId: string) => {
  return prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true, pricePerDay: true },
  });
};

export const checkOverlap = async (listingId: string, start: Date, end: Date) => {
  return prisma.booking.findFirst({
    where: {
      listingId,
      status: { in: ["pending", "approved"] },
      OR: [
        {
          startDate: { lte: end },
          endDate: { gte: start },
        },
      ],
    },
  });
};

export const create = async (data: {
  listingId: string;
  renterId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
}) => {
  return prisma.booking.create({
    data: {
      ...data,
      status: "pending",
    },
  });
};

export const findAllByUser = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const whereClause = {
    OR: [
      { renterId: userId },
      { listing: { ownerId: userId } },
    ],
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      include: {
        listing: {
          select: { title: true, pricePerDay: true, ownerId: true },
        },
        renter: {
          select: { name: true, email: true },
        },
      },
      orderBy: { startDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where: whereClause }),
  ]);

  return { bookings, total };
};

export const findById = async (id: string) => {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      listing: true,
      renter: {
        select: { name: true, email: true },
      },
    },
  });
};

export const findWithListing = async (id: string) => {
  return prisma.booking.findUnique({
    where: { id },
    include: { listing: { select: { ownerId: true } } },
  });
};

export const updateStatus = async (id: string, status: string) => {
  return prisma.booking.update({
    where: { id },
    data: { status },
  });
};
