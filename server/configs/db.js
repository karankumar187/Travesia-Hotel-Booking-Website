import mongoose from "mongoose";

// Cache the connection across serverless function invocations.
// On Vercel/serverless, the module is re-evaluated on cold starts, but the
// Node.js module cache persists within the same container lifecycle.
// Storing the promise on `global` ensures hot invocations skip reconnecting.
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  // Already connected — return immediately
  if (cached.conn) {
    return cached.conn;
  }

  // Connection in progress — wait for it instead of opening a second one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,       // Don't buffer — fail fast if not connected
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,             // Reuse up to 10 connections
    };

    cached.promise = mongoose
      .connect(`${process.env.MONGODB_URI}/hotel-booking`, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected");
        return mongooseInstance;
      })
      .catch((err) => {
        // Clear promise so the next request retries
        cached.promise = null;
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

export default connectDB;