import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Review from "../models/Review.js";

// GET /api/stats
export const getStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get total bookings count
    const totalBookings = await Booking.countDocuments();

    // Get total hotels count
    const totalHotels = await Hotel.countDocuments();

    // Get overall average rating from reviews
    const reviews = await Review.find({}, { rating: 1 });
    const overallRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        totalHotels,
        overallRating: Math.round(overallRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};

