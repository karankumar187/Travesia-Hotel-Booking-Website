import { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext1";
import toast from "react-hot-toast";
import StarRating from "../components/StarRating";
import { Navigation } from "lucide-react";

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
  const [couponStates, setCouponStates] = useState({});
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [modalCouponCode, setModalCouponCode] = useState("");
  const [modalAppliedCoupon, setModalAppliedCoupon] = useState(null);

  const VALID_COUPONS = {
    'WELCOME10': 0.10, 
    'SUMMER20': 0.20,  
    'TRAVESIA50': 0.50, 
    'WEEKEND15': 0.15, 
    'FIRSTSTAY5': 0.05, 
    'LUXURY25': 0.25   
  };

  const handleApplyModalCoupon = () => {
    if (!modalCouponCode) return;
    const code = modalCouponCode.toUpperCase();
    if(VALID_COUPONS[code]) {
       setModalAppliedCoupon({ code, discount: VALID_COUPONS[code] });
       toast.success("Coupon applied!");
    } else {
       setModalAppliedCoupon(null);
       toast.error("Invalid coupon code");
    }
  };

  const resetModal = () => {
    setPaymentBooking(null);
    setModalCouponCode("");
    setModalAppliedCoupon(null);
  };
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
        const couponCode = modalAppliedCoupon?.code || "";
        const response = await axios.post(
          `/api/bookings/payment/${bookingId}`,
          { couponCode },
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
            resetModal();
          }
        },
        prefill: {
          name: data.customerName || "Guest",
          email: data.customerEmail || "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(null);
            resetModal();
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

  const handleDownloadInvoice = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) {
      toast.error("Booking data not found");
      return;
    }

    const invoiceId = `INV-${bookingId.slice(-8).toUpperCase()}`;
    const bookingDate = new Date(booking.createdAt).toLocaleDateString("en-IN");
    const checkIn = new Date(booking.checkInDate).toDateString();
    const checkOut = new Date(booking.checkOutDate).toDateString();
    const nights = Math.ceil(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
    );

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoiceId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; color: #333; }
    .page { max-width: 700px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #1a56db 0%, #0e3fa0 100%); color: white; padding: 40px 48px 32px; }
    .header h1 { font-size: 32px; letter-spacing: 4px; font-weight: 800; }
    .header p { margin-top: 6px; opacity: 0.75; font-size: 13px; letter-spacing: 1px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35); border-radius: 20px; padding: 4px 14px; font-size: 11px; margin-top: 14px; }
    .body { padding: 40px 48px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 36px; }
    .meta-item label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .meta-item p { font-size: 14px; font-weight: 600; margin-top: 4px; }
    .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1a56db; font-weight: 700; margin-bottom: 16px; border-bottom: 2px solid #e8f0fe; padding-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
    .field label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .field p { font-size: 14px; font-weight: 500; margin-top: 3px; }
    .total-box { background: #f0f5ff; border: 1px solid #c7d9ff; border-radius: 10px; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .total-box .label { font-size: 13px; color: #555; }
    .total-box .amount { font-size: 28px; font-weight: 800; color: #1a56db; }
    .footer { background: #f9f9f9; border-top: 1px solid #eee; padding: 24px 48px; text-align: center; font-size: 12px; color: #aaa; }
    @media print {
      body { background: #fff; }
      .page { box-shadow: none; margin: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>TRAVESÍA</h1>
      <p>OFFICIAL BOOKING INVOICE</p>
      <span class="badge">✓ PAYMENT CONFIRMED</span>
    </div>
    <div class="body">
      <div class="meta">
        <div class="meta-item">
          <label>Invoice ID</label>
          <p>${invoiceId}</p>
        </div>
        <div class="meta-item">
          <label>Booking Date</label>
          <p>${bookingDate}</p>
        </div>
        <div class="meta-item">
          <label>Payment Method</label>
          <p>${(booking.paymentMethod || "Razorpay").toUpperCase()}</p>
        </div>
      </div>

      <div class="section-title">Reservation Details</div>
      <div class="grid">
        <div class="field"><label>Hotel</label><p>${booking.hotel?.name || "Travesia Property"}</p></div>
        <div class="field"><label>Room Type</label><p>${booking.room?.roomType || "Standard Room"}</p></div>
        <div class="field"><label>Address</label><p>${booking.hotel?.address || "India"}</p></div>
        <div class="field"><label>Guests</label><p>${booking.guests}</p></div>
        <div class="field"><label>Check-In</label><p>${checkIn}</p></div>
        <div class="field"><label>Check-Out</label><p>${checkOut}</p></div>
        <div class="field"><label>Duration</label><p>${nights} Night${nights > 1 ? "s" : ""}</p></div>
      </div>

      <div class="section-title">Payment Summary</div>
      <div class="total-box">
        <div class="label">Total Amount Paid</div>
        <div class="amount">₹${Number(booking.totalPrice).toLocaleString("en-IN")}</div>
      </div>
    </div>
    <div class="footer">
      Thank you for choosing Travesía &nbsp;•&nbsp; We hope to welcome you again!
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script>
    window.onload = () => { 
      const element = document.querySelector('.page');
      const opt = {
        margin:       0,
        filename:     '${invoiceId}.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        setTimeout(() => window.close(), 1000);
      });
    };
  </script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Please allow pop-ups to download invoice");
      return;
    }
    win.document.write(html);
    win.document.close();
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
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${booking.hotel.location.lat},${booking.hotel.location.lng}`, '_blank')}
                  className="mt-2 w-max flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                >
                  <Navigation size={12} />
                  Get Directions
                </button>
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
                <div className="flex flex-col gap-2 mt-2 sm:mt-4 w-full sm:w-auto">
                  <button 
                    onClick={() => setPaymentBooking(booking)}
                    className="px-4 py-2 text-sm text-white border rounded-full transition cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 font-medium shadow-sm"
                  >
                    Pay
                  </button>
                </div>
              )}

              {booking.isPaid && booking.status === "confirmed" && (
                <div className="mt-2 sm:mt-4 flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDownloadInvoice(booking._id)}
                    className="w-full px-3 sm:px-4 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition cursor-pointer"
                  >
                    Download Invoice
                  </button>
                  {canReviewStates[booking._id] && !reviewStates[booking._id]?.show && (
                    <button
                      onClick={() =>
                        setReviewStates((prev) => ({
                          ...prev,
                          [booking._id]: { show: true, rating: 0, comment: "" },
                        }))
                      }
                      className="w-full px-3 sm:px-4 py-1.5 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"
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

      {/* Payment Modal Overlay */}
      {paymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 p-5 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent)]" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Secure Checkout</p>
              <h3 className="text-xl font-semibold playfair-font">{paymentBooking.hotel?.name || "Hotel"}</h3>
              <p className="text-gray-400 text-sm mt-0.5">{paymentBooking.room?.roomType} &bull; {paymentBooking.guests} guest{paymentBooking.guests > 1 ? "s" : ""}</p>
            </div>

            <div className="p-6">
              {/* Base amount */}
              <div className="flex justify-between items-center rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-5">
                <span className="text-sm text-gray-500 font-medium">Base Total</span>
                <span className="text-base font-semibold text-gray-800">₹{paymentBooking.totalPrice.toLocaleString()}</span>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Promo Code <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={modalCouponCode}
                    onChange={(e) => setModalCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:border-gray-300 uppercase tracking-wider outline-none transition-all bg-gray-50"
                  />
                  <button
                    onClick={handleApplyModalCoupon}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-colors tracking-wide"
                  >
                    Apply
                  </button>
                </div>
                {modalAppliedCoupon && (
                  <p className="text-emerald-600 text-xs mt-2.5 flex items-center gap-1.5 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    "{modalAppliedCoupon.code}" — {modalAppliedCoupon.discount * 100}% discount applied!
                  </p>
                )}
              </div>

              {/* Divider & Final amount */}
              <div className="border-t border-dashed border-gray-200 pt-4 mb-6 flex justify-between items-center">
                <span className="text-gray-800 font-semibold">Total Payable</span>
                <div className="text-right">
                  {modalAppliedCoupon && (
                    <p className="text-xs text-gray-400 line-through">₹{paymentBooking.totalPrice.toLocaleString()}</p>
                  )}
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{modalAppliedCoupon
                        ? Math.floor(paymentBooking.totalPrice * (1 - modalAppliedCoupon.discount)).toLocaleString()
                        : paymentBooking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processingPayment === paymentBooking._id}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePayment(paymentBooking._id)}
                  disabled={processingPayment === paymentBooking._id}
                  className={`flex-[2] px-4 py-3 text-white rounded-xl text-sm font-semibold transition-all flex justify-center items-center gap-2 cursor-pointer ${
                    processingPayment === paymentBooking._id
                      ? "bg-gray-400 cursor-wait"
                      : "bg-gray-900 hover:bg-gray-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {processingPayment === paymentBooking._id
                    ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Processing...</>
                    : "Proceed to Checkout →"}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                Secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}
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
