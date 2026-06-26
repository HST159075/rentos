import type { Request, Response } from "express";
import * as listingService from "../services/listing.service";

// API No.6  POST  /api/listings  — Create a new listing
export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, pricePerDay, depositAmount } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category || !pricePerDay || !depositAmount) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const listing = await listingService.create({
      title,
      description,
      category,
      pricePerDay,
      depositAmount,
      ownerId: userId,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.7  GET   /api/listings  — Get all listings (paginated)
export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { listings, total } = await listingService.findAll(page, limit);

    res.status(200).json({
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.8  GET   /api/listings/:id  — Get single listing
export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const listing = await listingService.findById(id);

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.9  PUT   /api/listings/:id  — Update listing
export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, category, pricePerDay, depositAmount, status } = req.body;
    const userId = req.user.id;

    const existingListing = await listingService.findOwner(id);
    if (!existingListing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (existingListing.ownerId !== userId) {
      res.status(403).json({ message: "You are not authorized to update this listing" });
      return;
    }

    const updatedListing = await listingService.update(id, {
      title,
      description,
      category,
      pricePerDay,
      depositAmount,
      status,
    });

    res.status(200).json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.10 DELETE /api/listings/:id  — Delete listing
export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    const existingListing = await listingService.findOwner(id);
    if (!existingListing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (existingListing.ownerId !== userId) {
      res.status(403).json({ message: "You are not authorized to delete this listing" });
      return;
    }

    await listingService.remove(id);

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
