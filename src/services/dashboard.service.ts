import { prisma } from "../lib/prisma";

export const getAdminStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalListings = await prisma.listing.count();
  const totalBookings = await prisma.booking.count();

  const totalRevenueResult = await prisma.booking.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: { status: "approved" },
  });

  const roleBreakdown = await prisma.user.groupBy({
    by: ["role"],
    _count: {
      _all: true,
    },
  });

  return {
    totalUsers,
    totalListings,
    totalBookings,
    totalRevenue: totalRevenueResult._sum.totalPrice || 0,
    roleBreakdown,
  };
};

export const getOwnerStats = async (userId: string) => {
  const totalListings = await prisma.listing.count({
    where: { ownerId: userId },
  });

  const totalBookingsReceived = await prisma.booking.count({
    where: { listing: { ownerId: userId } },
  });

  const earningsResult = await prisma.booking.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      listing: { ownerId: userId },
      status: "approved",
    },
  });

  const recentBookings = await prisma.booking.findMany({
    where: { listing: { ownerId: userId } },
    include: {
      listing: { select: { title: true } },
      renter: { select: { name: true, email: true } },
    },
    orderBy: { startDate: "desc" },
    take: 5,
  });

  return {
    totalListings,
    totalBookingsReceived,
    totalEarnings: earningsResult._sum.totalPrice || 0,
    recentBookings,
  };
};

export const getRenterStats = async (userId: string) => {
  const totalBookingsMade = await prisma.booking.count({
    where: { renterId: userId },
  });

  const upcomingBookingsCount = await prisma.booking.count({
    where: {
      renterId: userId,
      startDate: { gte: new Date() },
      status: "approved",
    },
  });

  const totalSpentResult = await prisma.booking.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      renterId: userId,
      status: "approved",
    },
  });

  const recentBookings = await prisma.booking.findMany({
    where: { renterId: userId },
    include: {
      listing: { select: { title: true, ownerId: true } },
    },
    orderBy: { startDate: "desc" },
    take: 5,
  });

  return {
    totalBookingsMade,
    upcomingBookingsCount,
    totalSpent: totalSpentResult._sum.totalPrice || 0,
    recentBookings,
  };
};
