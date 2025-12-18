import HotelCard from "./HotelCard";
import Title from "./Title";
import { useAppContext } from "../context/AppContext1";
import { useEffect, useState } from "react";

export default function RecommendedHotels() {
  const { rooms, searchedCities } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  const filterHotels = () => {
    if (!searchedCities || searchedCities.length === 0) {
      setRecommended([]);
      return;
    }

    const filteredHotels = rooms.filter((room) =>
      searchedCities.includes(room.hotel.city)
    );

    setRecommended(filteredHotels);
  };

  useEffect(() => {
    filterHotels();
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
