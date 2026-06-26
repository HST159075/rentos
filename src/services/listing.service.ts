import { prisma } from "../lib/prisma";

interface CreateListingData {
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  depositAmount: number;
  ownerId: string;
}

interface UpdateListingData {
  title?: string;
  description?: string;
  category?: string;
  pricePerDay?: number;
  depositAmount?: number;
  status?: string;
}

export const create = async (data: CreateListingData) => {
  return prisma.listing.create({
    data: {
      ...data,
      status: "available",
    },
  });
};

export const findAll = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "available" },
      include: {
        owner: {
          select: { name: true },
        },
      },
      skip,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.listing.count({ where: { status: "available" } }),
  ]);

  return { listings, total };
};

export const findById = async (id: string) => {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
  });
};

export const update = async (id: string, data: UpdateListingData) => {
  return prisma.listing.update({
    where: { id },
    data,
  });
};

export const remove = async (id: string) => {
  return prisma.listing.delete({ where: { id } });
};

export const findOwner = async (id: string) => {
  return prisma.listing.findUnique({
    where: { id },
    select: { ownerId: true },
  });
};
