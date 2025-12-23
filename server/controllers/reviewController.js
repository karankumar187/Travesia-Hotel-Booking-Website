import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// Create a review for a booking
// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const auth = await req.auth();
    const user = auth.userId;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, rating, and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if booking exists and belongs to the user
    const booking = await Booking.findById(bookingId).populate("room hotel");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user !== user) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings",
      });
    }

    // Check if booking is confirmed/paid (user has actually stayed)
    if (booking.status !== "confirmed" || !booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: "You can only review confirmed and paid bookings",
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // Create review
    const review = await Review.create({
      user,
      room: booking.room._id,
      hotel: booking.hotel._id,
      booking: bookingId,
      rating,
      comment: comment.trim(),
    });

    // Populate user data for response
    const populatedReview = await Review.findById(review._id)
      .populate({
        path: "user",
        select: "username email image",
      })
      .populate({
        path: "room",
        select: "roomType",
      })
      .populate({
        path: "hotel",
        select: "name",
      });

    res.json({
      success: true,
      message: "Review created successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// Get reviews for a specific room
// GET /api/reviews/room/:roomId
export const getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({ room: roomId })
      .populate({
        path: "user",
        select: "username email image",
      })
      .populate({
        path: "room",
        select: "roomType",
      })
      .populate({
        path: "hotel",
        select: "name",
      })
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("GET ROOM REVIEWS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// Get recent reviews for home page
// GET /api/reviews/recent
export const getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const reviews = await Review.find()
      .populate({
        path: "user",
        select: "username email image",
      })
      .populate({
        path: "room",
        select: "roomType images",
      })
      .populate({
        path: "hotel",
        select: "name address city",
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET RECENT REVIEWS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent reviews",
      error: error.message,
    });
  }
};

// Check if user can review a booking
// GET /api/reviews/can-review/:bookingId
export const canReviewBooking = async (req, res) => {
  try {
    const auth = await req.auth();
    const user = auth.userId;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user !== user) {
      return res.json({
        success: true,
        canReview: false,
        message: "This is not your booking",
      });
    }

    if (booking.status !== "confirmed" || !booking.isPaid) {
      return res.json({
        success: true,
        canReview: false,
        message: "You can only review confirmed and paid bookings",
      });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
        message: "You have already reviewed this booking",
        hasReviewed: true,
      });
    }

    res.json({
      success: true,
      canReview: true,
    });
  } catch (error) {
    console.error("CAN REVIEW ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check review eligibility",
      error: error.message,
    });
  }
};

