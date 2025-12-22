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

    // Case-insensitive city matching
    const filteredHotels = rooms.filter((room) => {
      if (!room.hotel || !room.hotel.city) return false;
      return searchedCities.some(
        (searchedCity) =>
          searchedCity &&
          room.hotel.city &&
          searchedCity.toLowerCase().trim() === room.hotel.city.toLowerCase().trim()
      );
    });

    return filteredHotels;
  }, [rooms, searchedCities]);

  if (recommended.length === 0) return null;

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 bg-slate-50 py-12">
      <Title
        title="Recommended Destinations"
        subTitle="Handpicked stays inspired by your recent searches, offering comfort, familiarity, and a truly personal experience."
      />

      <div className="flex flex-wrap items-center justify-center gap-4 mt-20">
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>
    </div>
  );
}
