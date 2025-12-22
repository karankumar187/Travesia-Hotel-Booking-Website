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

  /* ---------------- Load Room ---------------- */
  useEffect(() => {
    const foundRoom = rooms.find((r) => r._id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      setMainImage(foundRoom.images[0]);
    }
  }, [rooms, id]);

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
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Title */}
      <h1 className="text-4xl playfair-font">
        {room.hotel.name} <span className="text-sm">({room.roomType})</span>
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2 mt-2">
        <StarRating rating={room.hotel.rating} />
        <p>200+ reviews</p>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location" />
        <span>{room.hotel.address}</span>
      </div>

      {/* Images */}
      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 rounded-xl overflow-hidden">
          <img src={mainImage} className="w-full h-full object-cover" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:w-1/2">
          {room.images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setMainImage(img)}
              className={`cursor-pointer rounded-xl ${
                mainImage === img ? "ring-4 ring-orange-500" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-8 flex flex-wrap gap-3">
        {room.amenities.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded"
          >
            <img src={facilityIcons[item]} className="w-5 h-5" />
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>

      {/* Price */}
      <p className="text-2xl font-medium mt-6">₹{room.pricePerNight} / night</p>

      {/* Booking Form */}
      <form
        onSubmit={onSubmitHandler}
        className="
    flex flex-col md:flex-row items-stretch md:items-end
    gap-4 md:gap-6
    bg-white/70 backdrop-blur-md
    border border-white/40
    p-6 md:p-8
    rounded-2xl
    mt-10
    max-w-5xl
  "
      >
        {/* Check-in */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkInDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="
        border border-gray-300
        px-4 py-2.5
        rounded-lg
        text-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
            required
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkOutDate}
            min={checkInDate || undefined}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="
        border border-gray-300
        px-4 py-2.5
        rounded-lg
        text-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
            required
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col w-full md:w-32">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Guests
          </label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="
        border border-gray-300
        px-4 py-2.5
        rounded-lg
        text-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
            required
          />
        </div>

        {/* Button */}
        <button
  type={isAvailable ? "submit" : "button"}
  onClick={!isAvailable ? checkAvailability : undefined}
  className="
    w-full md:w-auto
    bg-blue-600
    text-white
    px-8 py-2
    rounded-xl
    font-medium
    hover:bg-blue-700
    cursor-pointer
  "
>
  {isAvailable ? "Book Now" : "Check Availability"}
</button>

      </form>

      {/* Common Info */}
      <div className="mt-16 space-y-4">
        {roomCommonData.map((item, i) => (
          <div key={i} className="flex gap-3">
            <img src={item.icon} className="w-6" />
            <div>
              <p>{item.title}</p>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Owner Details - Bottom of Page */}
      {room.hotel?.owner && (
        <div className="mt-16 p-6 md:p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 playfair-font">About Your Host</h3>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {room.hotel.owner.image && (
              <img 
                src={room.hotel.owner.image} 
                alt="Owner" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-md"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Hosted by</p>
              <p className="text-xl font-semibold text-gray-800 playfair-font">{room.hotel.owner.username || "Hotel Owner"}</p>
              {room.hotel.owner.email && (
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">{room.hotel.owner.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
