import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import listingRoutes from "./routes/listing.routes";
import bookingRoutes from "./routes/booking.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

//  Security Middlewares 
app.use(helmet());

//  CORS 
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

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error("Unhandled error captured:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
});

// Start Server
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
});
