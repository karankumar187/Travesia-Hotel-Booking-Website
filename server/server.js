import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinaryApi.js";

import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import statsRouter from "./routes/statsRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import { testEmail } from "./controllers/emailController.js";
import { createServer } from "http";
import { Server } from "socket.io";

connectCloudinary();

// Ensure DB is connected on every request (critical for Vercel serverless)
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(500).json({ success: false, message: "Database unavailable. Please try again." });
  }
};


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Pass io to request so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());

// Clerk webhook (RAW body)
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// normal middleware
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.end("API is working"));

// Guarantee DB connection before any API route
app.use("/api", ensureDB);

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/stats", statsRouter);
app.use("/api/ai", aiRouter);

// Test email endpoint (for debugging)
app.post("/api/test-email", testEmail);

// Export for Vercel serverless functions
export default app;

// Start server for local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server running on PORT ${PORT}`)
  );
}