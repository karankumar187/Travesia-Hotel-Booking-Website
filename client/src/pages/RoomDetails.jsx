import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets, facilityIcons, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext1";
import toast from "react-hot-toast";

export default function RoomDetails() {
  const { id } = useParams();
  const { navigate, getToken, rooms, axios } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  const [isAvailable, setIsAvailable] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  /* ---------------- Scroll to Top ---------------- */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [id]);

  /* ---------------- Load Room ---------------- */
  useEffect(() => {
    const foundRoom = rooms.find((r) => r._id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      setMainImage(foundRoom.images[0]);
    }
  }, [rooms, id]);

  /* ---------------- Load Reviews ---------------- */
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const { data } = await axios.get(`/api/reviews/room/${id}`);
        if (data.success) {
          setReviews(data.reviews);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };
    fetchReviews();
  }, [id, axios]);

  /* -------- Reset availability when dates change -------- */
  useEffect(() => {
    setIsAvailable(false);
  }, [checkInDate, checkOutDate]);

  /* ---------------- Check Availability ---------------- */
  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select both dates");
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast.error("Check-Out date must be after Check-In date");
      return;
    }

    try {
      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
      });

      if (data.success && data.isAvailable) {
        setIsAvailable(true);
        toast.success("Room is available");
      } else {
        setIsAvailable(false);
        toast.error("Room is unavailable");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  /* ---------------- Book Room ---------------- */
  const onSubmitHandler = async (e) => {
  e.preventDefault();

  if (!checkInDate || !checkOutDate) {
    toast.error("Please select check-in and check-out dates");
    return;
  }

  try {
    const { data } = await axios.post(
      "/api/bookings/book",
      {
        room: id,
        checkInDate,    
        checkOutDate,   
        guests,
      },
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      }
    );

    if (data.success) {
      toast.success("Booking created successfully");
      navigate("/my-bookings");
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};


  if (!room) return null;

  return (
    <div className="py-20 sm:py-24 md:py-28 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl playfair-font">
        {room.hotel.name} <span className="text-xs sm:text-sm">({room.roomType})</span>
      </h1>

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <StarRating rating={averageRating || room.hotel.rating || 4} />
        <p className="text-sm sm:text-base">{totalReviews > 0 ? `${totalReviews} review${totalReviews !== 1 ? 's' : ''}` : 'No reviews yet'}</p>
        {averageRating > 0 && (
          <span className="text-sm sm:text-base text-gray-600">({averageRating.toFixed(1)} rating)</span>
        )}
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm sm:text-base">
        <img src={assets.locationIcon} alt="location" className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{room.hotel.address}</span>
      </div>

      {/* Images */}
      <div className="flex flex-col lg:flex-row mt-4 sm:mt-6 gap-3 sm:gap-4 lg:gap-6">
        <div className="lg:w-1/2 rounded-lg sm:rounded-xl overflow-hidden">
          <img src={mainImage} className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover" alt="Main room image" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 lg:w-1/2">
          {room.images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setMainImage(img)}
              className={`cursor-pointer rounded-lg sm:rounded-xl h-24 sm:h-32 md:h-40 object-cover ${
                mainImage === img ? "ring-2 sm:ring-4 ring-orange-500" : ""
              }`}
              alt={`Room image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
        {room.amenities.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm"
          >
            <img src={facilityIcons[item]} className="w-4 h-4 sm:w-5 sm:h-5" alt={item} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Price */}
      <p className="text-xl sm:text-2xl font-medium mt-4 sm:mt-6">₹{room.pricePerNight} / night</p>

      {/* Booking Form */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4 md:gap-6 bg-white/70 backdrop-blur-md border border-white/40 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl mt-6 sm:mt-8 md:mt-10 max-w-5xl"
      >
        {/* Check-in */}
        <div className="flex flex-col w-full">
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkInDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col w-full">
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkOutDate}
            min={checkInDate || undefined}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col w-full md:w-32">
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Guests
          </label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Button */}
        <button
          type={isAvailable ? "submit" : "button"}
          onClick={!isAvailable ? checkAvailability : undefined}
          className="w-full md:w-auto bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isAvailable ? "Book Now" : "Check Availability"}
        </button>
      </form>

      {/* Common Info */}
      <div className="mt-8 sm:mt-12 md:mt-16 space-y-3 sm:space-y-4">
        {roomCommonData.map((item, i) => (
          <div key={i} className="flex gap-2 sm:gap-3">
            <img src={item.icon} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" alt={item.title} />
            <div>
              <p className="text-sm sm:text-base font-medium">{item.title}</p>
              <p className="text-gray-500 text-xs sm:text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews Section */}
      <div className="mt-8 sm:mt-12 md:mt-16">
        <h2 className="text-xl sm:text-2xl font-bold playfair-font text-gray-800 mb-4 sm:mb-6">
          Reviews {totalReviews > 0 && `(${totalReviews})`}
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {review.user?.image ? (
                    <img
                      src={review.user.image}
                      alt={review.user.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-semibold text-sm sm:text-base">
                        {review.user?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <p className="font-semibold text-sm sm:text-base text-gray-800">
                        {review.user?.username || "Anonymous"}
                      </p>
                      <StarRating rating={review.rating} />
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 break-words">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 sm:p-8 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 text-center">
            <p className="text-sm sm:text-base text-gray-600">No reviews yet. Be the first to review this room!</p>
          </div>
        )}
      </div>

      {/* Owner Details - Bottom of Page */}
      {room.hotel?.owner && (
        <div className="mt-8 sm:mt-12 md:mt-16 p-4 sm:p-6 md:p-8 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 playfair-font">About Your Host</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {room.hotel.owner.image && (
              <img 
                src={room.hotel.owner.image} 
                alt="Owner" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 shadow-md flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Hosted by</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-800 playfair-font break-words">{room.hotel.owner.username || "Hotel Owner"}</p>
              {room.hotel.owner.email && (
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs sm:text-sm text-gray-600 break-all">{room.hotel.owner.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
