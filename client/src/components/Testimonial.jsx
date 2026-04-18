import { useEffect, useState, useRef } from "react";
import Title from "./Title";
import StarRating from "./StarRating";
import { useAppContext } from "../context/AppContext1";

const REFRESH_INTERVAL = 30_000; // re-fetch every 30 seconds

export default function Testimonial() {
  const { axios } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get("/api/reviews/recent?limit=10");
      if (data.success && data.reviews?.length > 0) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // Poll for new reviews every 30s so the section stays fresh
    timerRef.current = setInterval(fetchReviews, REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  // Duplicate enough times so the marquee scrolls smoothly regardless of count
  const getMarqueeItems = () => {
    if (reviews.length === 0) return [];
    const minCards = 10;
    const times = Math.ceil(minCards / reviews.length) + 1;
    return Array.from({ length: times }, () => reviews).flat();
  };

  const marqueeItems = getMarqueeItems();

  return (
    <div className="flex flex-col items-center pb-20 py-20 w-full bg-white">
      <Title
        align="center"
        title="What Our Guests Say"
        subTitle="Discover why travelers choose Travesía for their stays. Hear from guests who've experienced exceptional comfort and service across our properties."
      />

      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner {
          animation: marqueeScroll 35s linear infinite;
          will-change: transform;
        }
        .marquee-inner:hover {
          animation-play-state: paused;
        }
      `}</style>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading reviews…</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="w-full mx-auto max-w-full overflow-hidden relative mt-4">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          <div className="absolute right-0 top-0 h-full w-16 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

          <div className="marquee-inner flex items-stretch min-w-[200%] py-6 gap-4 px-2">
            {marqueeItems.map((review, idx) => {
              const userImage = review.user?.image;
              const userName = review.user?.username || "Guest";
              const hotelName = review.hotel?.name;
              const hotelCity = review.hotel?.city || review.hotel?.address;
              const location = hotelName
                ? `${hotelName}${hotelCity ? `, ${hotelCity}` : ""}`
                : hotelCity || "Travesia Guest";

              return (
                <div
                  key={`${review._id}-${idx}`}
                  className="p-4 rounded-lg mx-2 sm:mx-4 shadow hover:shadow-lg transition-all duration-200 w-72 sm:w-80 shrink-0 bg-white"
                >
                  {/* User row */}
                  <div className="flex gap-2">
                    {userImage ? (
                      <img
                        className="size-11 rounded-full object-cover"
                        src={userImage}
                        alt={userName}
                      />
                    ) : (
                      <div className="size-11 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-sm">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <p>{userName}</p>
                        <svg className="mt-0.5 fill-blue-500" width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.922.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-slate-500">{location}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="mt-4">
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Comment */}
                  <p className="text-sm py-4 text-gray-800">{review.comment}</p>

                  {/* Date */}
                  <p className="text-[11px] text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Guest reviews will appear here once bookings are completed.</p>
        </div>
      )}
    </div>
  );
}
