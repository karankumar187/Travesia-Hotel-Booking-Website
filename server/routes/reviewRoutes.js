import express from "express";
import {
  createReview,
  getRoomReviews,
  getRecentReviews,
  canReviewBooking,
  getHotelReviewStats,
  getBulkHotelReviewStats,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, createReview);
reviewRouter.get("/room/:roomId", getRoomReviews);
reviewRouter.get("/recent", getRecentReviews);
reviewRouter.get("/can-review/:bookingId", protect, canReviewBooking);
reviewRouter.get("/hotel/:hotelId/stats", getHotelReviewStats);
reviewRouter.post("/hotels/stats", getBulkHotelReviewStats);

export default reviewRouter;

