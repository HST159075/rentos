import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import ServerlessHttp from "serverless-http";
import listingRoutes from "./routes/listing.routes";
import bookingRoutes from "./routes/booking.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

// Security Middlewares
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
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

app.get("/", (req, res) => {
  res.status(200).json({ message: "Rento server is running" });
});

// Health Check
// API No.5  GET  /health  — Server health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API Routes
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    console.error("Unhandled error captured:", err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      message: err.message || "Internal server error",
    });
  },
);

export default app;
export const handler = ServerlessHttp(app);
