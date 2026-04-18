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

// Non-async, non-blocking initialization at module level
connectCloudinary();

// Ensure DB is connected on every request (critical for Vercel serverless cold starts)
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

// Socket.io — only initialize in long-running environments (not Vercel serverless)
// On Vercel, io will be null; controllers safely check before emitting.
let io = null;
if (!process.env.VERCEL) {
  import("socket.io").then(({ Server }) => {
    io = new Server(httpServer, { cors: { origin: "*" } });
    console.log("🔌 Socket.io initialized");
  }).catch((err) => {
    console.warn("⚠️  Socket.io init failed:", err.message);
  });
}

// Inject io into every request (may be null on serverless)
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());

// Clerk webhook — raw body BEFORE express.json()
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Standard middleware
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.end("API is working"));

// Guarantee DB connection before any API route handler runs
app.use("/api", ensureDB);

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/stats", statsRouter);
app.use("/api/ai", aiRouter);
app.post("/api/test-email", testEmail);

// Export Express app for Vercel serverless handler
export default app;

// Local dev — start HTTP server only outside Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => console.log(`🚀 Server running on PORT ${PORT}`));
}