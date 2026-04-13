import React from 'react';
import { useAppContext } from "../context/AppContext1";
import { facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";

export default function Wishlist() {
  const { wishlist, navigate, currency, toggleWishlist } = useAppContext();

  return (
    <div className="pt-28 px-4 md:px-16 lg:px-24 mb-10 min-h-[60vh]">
      <h1 className="text-3xl playfair-font mb-8">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20 px-4 bg-gray-50 rounded-xl border">
          <p className="text-gray-500 mb-6">Your wishlist is currently empty.</p>
          <button 
             onClick={() => navigate('/rooms')}
             className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
             Explore Rooms
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((roomRaw, index) => {
            // Need to handle if room is just an ID or object
            const room = typeof roomRaw === 'string' ? null : roomRaw;
            if (!room) return null;
            
            return (
              <article
                key={room._id}
                className="flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={room.images[0]}
                    alt=""
                    onClick={() => navigate(`/rooms/${room._id}`)}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-700 hover:scale-105"
                  />
                  <button 
                    onClick={() => toggleWishlist(room._id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-red-500 hover:scale-110 transition cursor-pointer"
                    title="Remove from wishlist"
                  >
                    ❤️
                  </button>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{room.hotel?.city}</p>
                    <h2
                      className="text-xl playfair-font cursor-pointer line-clamp-1"
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      title={`${room.hotel?.name} - ${room.roomType}`}
                    >
                      {room.hotel?.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{room.roomType}</p>

                    <div className="flex items-center gap-2 mt-2">
                       <StarRating rating={room.hotel?.reviewStats?.averageRating || room.hotel?.rating || 0} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 border-t pt-4">
                    <p className="text-lg font-medium">
                      {currency} {room.pricePerNight} <span className="text-xs text-gray-500 font-normal">/ night</span>
                    </p>
                    <button
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
