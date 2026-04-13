import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext1";
import { Heart } from "lucide-react";

export default function HotelCard({room, index}) {
    const { wishlist, toggleWishlist, user } = useAppContext();
    const isWishlisted = wishlist?.some(item => item._id === room._id || item === room._id);
    return (
        <Link to={"/rooms/" + room._id} onClick={() => scrollTo(0,0)} key={room._id} className="relative max-w-70 w-full rounded-lg sm:rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
            <img src={room.images[0]} alt={room.hotel.name} className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 hover:scale-105"/>

            {index%2===0 && <p className="px-2 sm:px-3 py-1 absolute top-2 sm:top-3 left-2 sm:left-3 text-xs bg-white text-gray-800 font-medium rounded-full shadow-sm">Best Seller</p>}

            {user && (
                <button 
                  onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(room._id);
                  }}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 bg-white/70 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm z-10"
                >
                  <Heart size={16} className={`transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-gray-900"}`} />
                </button>
            )}

            <div className="p-3 sm:p-4 pt-4 sm:pt-5">
                <div className="flex items-center justify-between gap-2">
                    <p className="playfair-font text-lg sm:text-xl font-medium text-gray-800 truncate flex-1">{room.hotel.name}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <img src={assets.starIconFilled} alt="star-icon" className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">
                            {room.hotel.reviewStats?.totalReviews > 0
                              ? room.hotel.reviewStats.averageRating.toFixed(1)
                              : 'New'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm mt-1">
                        <img src={assets.locationIcon} alt="location-icon" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{room.hotel.address}</span>
                </div>
                <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2">
                        <p className="text-sm sm:text-base"><span className="text-lg sm:text-xl text-gray-800 font-medium">₹{room.pricePerNight}</span><span className="text-xs sm:text-sm">/night</span></p>
                        <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap">Book Now</button>
                </div>
            </div>
        </Link>
    )
}