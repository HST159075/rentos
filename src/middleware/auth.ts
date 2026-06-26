import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request object to include the user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your User type from Better Auth if desired
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      res.status(401).json({ message: "Unauthorized: Please log in." });
      return;
    }

    // We need to fetch the user from DB to get their role, since Better Auth 
    // might not include custom fields in session.user by default without extra config.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      res.status(401).json({ message: "User not found." });
      return;
    }

    if (user.status === "banned" || user.status === "suspended") {
      res.status(403).json({ message: "Your account has been restricted." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal server error during authentication" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: Please log in." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: You do not have the required permissions." });
      return;
    }

    next();
  };
};
