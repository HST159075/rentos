import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();

// Security Middlewares
app.use(helmet());

// CORS
// TODO(security): In production, restrict FRONTEND_URL to your actual domain only.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth
// Must come BEFORE express.json() middleware
// API No.1  POST  /api/auth/sign-up/email  — Register new user
// API No.2  POST  /api/auth/sign-in/email  — Login
// API No.3  POST  /api/auth/sign-out       — Logout
// API No.4  GET   /api/auth/session        — Get current session
app.all("/api/auth/*splat", toNodeHandler(auth));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
// API No.5  GET  /health  — Server health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
