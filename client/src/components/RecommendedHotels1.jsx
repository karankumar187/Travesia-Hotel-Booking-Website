import HotelCard from "./HotelCard";
import Title from "./Title";
import { useAppContext } from "../context/AppContext1";
import { useEffect, useState, useMemo } from "react";

export default function RecommendedHotels() {
  const { rooms, searchedCities } = useAppContext();

  // Use useMemo to filter hotels based on searched cities
  const recommended = useMemo(() => {
    if (!searchedCities || searchedCities.length === 0) {
      return [];
    }

    if (!rooms || rooms.length === 0) {
      return [];
    }

    // Case-insensitive city matching with better normalization
    const filteredHotels = rooms.filter((room) => {
      if (!room.hotel || !room.hotel.city) return false;
      
      const roomCity = room.hotel.city.toString().toLowerCase().trim();
      
      return searchedCities.some((searchedCity) => {
        if (!searchedCity) return false;
        const searchCity = searchedCity.toString().toLowerCase().trim();
        
        // Exact match or partial match (in case of city with state/country)
        return roomCity === searchCity || 
               roomCity.includes(searchCity) || 
               searchCity.includes(roomCity);
      });
    });

    // Remove duplicates (same hotel appearing multiple times)
    const uniqueHotels = filteredHotels.filter((room, index, self) =>
      index === self.findIndex((r) => r.hotel._id === room.hotel._id)
    );

    return uniqueHotels;
  }, [rooms, searchedCities]);

  if (recommended.length === 0) return null;

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 bg-slate-50 py-8 sm:py-10 md:py-12">
      <Title
        title="Recommended Destinations"
        subTitle="Handpicked stays inspired by your recent searches, offering comfort, familiarity, and a truly personal experience."
      />

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-12 sm:mt-16 md:mt-20">
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>
    </div>
  );
}
