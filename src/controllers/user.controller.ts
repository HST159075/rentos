import type { Request, Response } from "express";
import * as userService from "../services/user.service";

// API No.19 GET /api/users/profile — Get user profile stats
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const profile = await userService.getProfile(userId);

    if (!profile) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API No.20 PUT /api/users/profile — Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    // Map avatarUrl to image if provided, to support both formats from the frontend
    const { name, image, avatarUrl } = req.body;
    
    const updateData: { name?: string; image?: string } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        res.status(400).json({ message: "Name must be a non-empty string" });
        return;
      }
      updateData.name = name;
    }

    // Support both 'image' and 'avatarUrl' from body
    const finalImage = image !== undefined ? image : avatarUrl;
    if (finalImage !== undefined) {
      if (finalImage !== null && typeof finalImage !== "string") {
        res.status(400).json({ message: "Image/avatarUrl must be a string or null" });
        return;
      }
      updateData.image = finalImage ?? undefined;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    const updatedUser = await userService.updateProfile(userId, updateData);

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
