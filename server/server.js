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

// Socket.io only works in long-running servers (not Vercel serverless).
// We attach it conditionally so the module doesn't crash on Vercel.
let io = null;
const isServerless = process.env.VERCEL === "1" || process.env.VERCEL === "true";

if (!isServerless) {
  const { createServer } = await import("http");
  const { Server } = await import("socket.io");
  const httpServer = createServer(app);
  io = new Server(httpServer, { cors: { origin: "*" } });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => console.log(`🚀 Server running on PORT ${PORT}`));
}

// Attach io to every request (null-safe — controllers check before emitting)
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());

// Clerk webhook (RAW body — must come before express.json())
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Normal middleware
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

app.post("/api/test-email", testEmail);

// Export for Vercel serverless
export default app;