import { prisma } from "../lib/prisma";

// API No.19 GET /api/users/profile — Get user profile stats
export const getProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          listings: true,
          bookings: true,
          reviewsReceived: true,
        },
      },
    },
  });
};

// API No.20 PUT /api/users/profile — Update user profile
export const updateProfile = async (
  userId: string,
  data: { name?: string; image?: string }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
