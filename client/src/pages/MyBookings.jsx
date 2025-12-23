import { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext1";
import toast from "react-hot-toast";
import StarRating from "../components/StarRating";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function MyBookings() {
  const { axios, getToken, user } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [reviewStates, setReviewStates] = useState({});
  const [canReviewStates, setCanReviewStates] = useState({});

  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to fetch bookings");
    }
  };

  const handlePayment = async (bookingId) => {
    setProcessingPayment(bookingId);
    try {
      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        toast.error("Failed to load payment gateway");
        setProcessingPayment(null);
        return;
      }

      // Create order on backend
      let data;
      try {
        const response = await axios.post(
          `/api/bookings/payment/${bookingId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        );
        data = response.data;
      } catch (error) {
        console.error("Payment order creation error:", error);
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Failed to create payment order";
        toast.error(errorMsg);
        setProcessingPayment(null);
        return;
      }

      if (!data.success) {
        const errorMsg = data.message || data.error || "Failed to create payment order";
        console.error("Payment order creation failed:", data);
        toast.error(errorMsg);
        setProcessingPayment(null);
        return;
      }

      // Check if keyId is present
      if (!data.keyId) {
        toast.error("Payment gateway not configured properly");
        setProcessingPayment(null);
        return;
      }

      // Initialize Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Hotel Booking",
        description: `Payment for booking ${data.bookingId}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              "/api/bookings/verify-payment",
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingId: data.bookingId,
              },
              {
                headers: {
                  Authorization: `Bearer ${await getToken()}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment processed successfully!");
              await fetchUserBookings();
            } else {
              toast.error(verifyResponse.data.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(error.response?.data?.message || "Payment verification failed");
          } finally {
            setProcessingPayment(null);
          }
        },
        prefill: {
          name: data.customerName || "Guest",
          email: data.customerEmail || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(null);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || error.message || "Payment failed");
      setProcessingPayment(null);
    }
  };

  const checkCanReview = async (bookingId) => {
    try {
      const { data } = await axios.get(`/api/reviews/can-review/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setCanReviewStates((prev) => ({
          ...prev,
          [bookingId]: data.canReview,
        }));
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  const handleSubmitReview = async (bookingId, rating, comment) => {
    try {
      const { data } = await axios.post(
        "/api/reviews",
        {
          bookingId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success("Review submitted successfully!");
        setReviewStates((prev) => ({
          ...prev,
          [bookingId]: { show: false, rating: 0, comment: "" },
        }));
        setCanReviewStates((prev) => ({
          ...prev,
          [bookingId]: false,
        }));
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, getToken]);

  useEffect(() => {
    // Check review eligibility for each paid booking
    bookings.forEach((booking) => {
      if (booking.isPaid && booking.status === "confirmed") {
        checkCanReview(booking._id);
      }
    });
  }, [bookings]);

  return (
    <div className="py-20 sm:py-24 md:py-28 md:pb-35 md:pt-32 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place."
        align="left"
      />

      <div className="max-w-6xl mt-6 sm:mt-8 w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 font-medium py-3 text-sm">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payments</div>
        </div>

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 py-4 sm:py-6 first:border-t gap-4 sm:gap-0"
          >
            {/* Hotel */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <img
                src={booking.room.images[0]}
                className="w-full sm:w-36 md:w-44 h-40 sm:h-28 rounded-lg object-cover"
                alt="room"
              />
              <div className="flex flex-col gap-1.5 sm:gap-2 md:ml-4">
                <p className="playfair-font text-xl sm:text-2xl">
                  {booking.hotel.name}{" "}
                  <span className="text-xs sm:text-sm font-inter">
                    ({booking.room.roomType})
                  </span>
                </p>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                  <img src={assets.locationIcon} alt="" className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="break-words">{booking.hotel.address}</span>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                  <img src={assets.guestsIcon} alt="" className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Guests: {booking.guests}</span>
                </div>
                <p className="text-sm sm:text-base font-medium">Total: ₹{booking.totalPrice}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex sm:flex-col md:flex-row md:items-center gap-4 sm:gap-2 md:gap-8 mt-2 sm:mt-0">
              <div>
                <p className="text-xs sm:text-sm font-medium">Check In</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {new Date(booking.checkInDate).toDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Check Out</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {new Date(booking.checkOutDate).toDateString()}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex flex-col justify-start sm:justify-center mt-2 sm:mt-0">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <span
                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${
                    booking.isPaid ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p
                  className={`text-xs sm:text-sm ${
                    booking.isPaid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {booking.isPaid ? "Paid" : "Unpaid"}
                </p>
              </div>

              {!booking.isPaid && (
                <button 
                  onClick={() => handlePayment(booking._id)}
                  disabled={processingPayment === booking._id}
                  className={`mt-2 sm:mt-4 px-3 sm:px-4 py-1.5 text-xs border rounded-full transition cursor-pointer w-full sm:w-auto ${
                    processingPayment === booking._id
                      ? "bg-gray-200 cursor-not-allowed opacity-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {processingPayment === booking._id ? "Processing..." : "Pay Now"}
                </button>
              )}

              {booking.isPaid && booking.status === "confirmed" && (
                <div className="mt-2 sm:mt-4">
                  {canReviewStates[booking._id] && !reviewStates[booking._id]?.show && (
                    <button
                      onClick={() =>
                        setReviewStates((prev) => ({
                          ...prev,
                          [booking._id]: { show: true, rating: 0, comment: "" },
                        }))
                      }
                      className="w-full sm:w-auto px-3 sm:px-4 py-1.5 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"
                    >
                      Write Review
                    </button>
                  )}
                  {reviewStates[booking._id]?.show && (
                    <ReviewForm
                      bookingId={booking._id}
                      rating={reviewStates[booking._id].rating}
                      comment={reviewStates[booking._id].comment}
                      onRatingChange={(rating) =>
                        setReviewStates((prev) => ({
                          ...prev,
                          [booking._id]: { ...prev[booking._id], rating },
                        }))
                      }
                      onCommentChange={(comment) =>
                        setReviewStates((prev) => ({
                          ...prev,
                          [booking._id]: { ...prev[booking._id], comment },
                        }))
                      }
                      onSubmit={() => {
                        const state = reviewStates[booking._id];
                        if (state.rating > 0 && state.comment.trim()) {
                          handleSubmitReview(booking._id, state.rating, state.comment);
                        } else {
                          toast.error("Please provide both rating and comment");
                        }
                      }}
                      onCancel={() =>
                        setReviewStates((prev) => ({
                          ...prev,
                          [booking._id]: { show: false, rating: 0, comment: "" },
                        }))
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p className="text-gray-500 mt-8 sm:mt-10 text-center text-sm sm:text-base">
            No bookings found.
          </p>
        )}
      </div>
    </div>
  );
}

// Review Form Component
function ReviewForm({ bookingId, rating, comment, onRatingChange, onCommentChange, onSubmit, onCancel }) {
  return (
    <div className="mt-2 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Write a Review</h4>
      <div className="mb-2 sm:mb-3">
        <label className="text-xs text-gray-600 mb-1 block">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="cursor-pointer"
            >
              <img
                src={star <= rating ? assets.starIconFilled : assets.starIconOutlined}
                className="h-4 w-4 sm:h-5 sm:w-5"
                alt={`${star} star`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2 sm:mb-3">
        <label className="text-xs text-gray-600 mb-1 block">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Share your experience..."
          className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="3"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"
        >
          Submit
        </button>
        <button
          onClick={onCancel}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
