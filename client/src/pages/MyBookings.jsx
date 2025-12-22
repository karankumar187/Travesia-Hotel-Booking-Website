import { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext1";
import toast from "react-hot-toast";

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

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, getToken]);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place."
        align="left"
      />

      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 font-medium py-3">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payments</div>
        </div>

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 py-6 first:border-t"
          >
            {/* Hotel */}
            <div className="flex flex-col md:flex-row">
              <img
                src={booking.room.images[0]}
                className="md:w-44 h-28 rounded object-cover"
                alt="room"
              />
              <div className="flex flex-col gap-1.5 md:ml-4 mt-3 md:mt-0">
                <p className="playfair-font text-2xl">
                  {booking.hotel.name}{" "}
                  <span className="text-sm font-inter">
                    ({booking.room.roomType})
                  </span>
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <img src={assets.locationIcon} alt="" />
                  <span>{booking.hotel.address}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <img src={assets.guestsIcon} alt="" />
                  <span>Guests: {booking.guests}</span>
                </div>
                <p>Total: ₹{booking.totalPrice}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex md:items-center gap-8 mt-4 md:mt-0">
              <div>
                <p>Check In</p>
                <p className="text-gray-500 text-sm">
                  {new Date(booking.checkInDate).toDateString()}
                </p>
              </div>
              <div>
                <p>Check Out</p>
                <p className="text-gray-500 text-sm">
                  {new Date(booking.checkOutDate).toDateString()}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex flex-col justify-center mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    booking.isPaid ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p
                  className={`text-sm ${
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
                  className={`mt-4 px-4 py-1.5 text-xs border rounded-full transition cursor-pointer w-1/2 ${
                    processingPayment === booking._id
                      ? "bg-gray-200 cursor-not-allowed opacity-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {processingPayment === booking._id ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p className="text-gray-500 mt-10 text-center">
            No bookings found.
          </p>
        )}
      </div>
    </div>
  );
}
