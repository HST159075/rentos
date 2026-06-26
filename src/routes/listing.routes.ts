import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller";
import { validateBody, createListingSchema, updateListingSchema } from "../middleware/validate";

const router = Router();

// API No.6  POST  /api/listings  — Create a new listing
router.post("/", requireAuth, validateBody(createListingSchema), createListing);

// API No.7  GET   /api/listings  — Get all listings
router.get("/", getListings);

// API No.8  GET   /api/listings/:id  — Get single listing
router.get("/:id", getListingById);

// API No.9  PUT   /api/listings/:id  — Update listing
router.put("/:id", requireAuth, validateBody(updateListingSchema), updateListing);

// API No.10 DELETE /api/listings/:id  — Delete listing
router.delete("/:id", requireAuth, deleteListing);

export default router;
