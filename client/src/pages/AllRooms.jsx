import { useNavigate } from "react-router-dom";
import { assets, facilityIcons, roomsDummyData } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useState } from "react";

const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex items-center gap-3 cursor-pointer mt-3 text-sm">
    <input
      type="checkbox"
      checked={!!selected}
      onChange={(e) => onChange(e.target.checked, label)}
      className="sr-only"
    />

    <span
      className={`flex items-center justify-center w-5 h-5 rounded-md border transition-colors duration-150
        ${
          selected ? "bg-gray-900 border-gray-900" : "bg-white border-gray-300"
        }`}
    >
      {selected && (
        <svg
          className="w-3 h-3 text-white"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M4.5 10.5l3 3 8-8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>

    <span className="font-light text-gray-700">{label}</span>
  </label>
);

const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex items-center gap-3 cursor-pointer mt-3 text-sm">
    <input
      type="radio"
      name="sortOption"
      checked={!!selected}
      onChange={() => onChange(label)}
      className="sr-only"
    />

    <span
      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-150
        ${selected ? "border-gray-900" : "border-gray-300"}`}
    >
      {selected && <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
    </span>

    <span className="font-light text-gray-700">{label}</span>
  </label>
);

export default function AllRooms() {
  const navigate = useNavigate();

  const [openFilters, setOpenFilters] = useState(false);

  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedSort, setSelectedSort] = useState(null);

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const priceRange = [
    "0 to 500",
    "500 to 1000",
    "1000 to 3000",
    "3000 to 5000",
  ];
  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First",
  ];

  const toggleRoomType = (checked, label) => {
    setSelectedRoomTypes((prev) =>
      checked ? [...prev, label] : prev.filter((r) => r !== label)
    );
  };

  const togglePriceRange = (checked, label) => {
    setSelectedPriceRanges((prev) =>
      checked ? [...prev, label] : prev.filter((p) => p !== label)
    );
  };

  const clearFilters = () => {
    setSelectedRoomTypes([]);
    setSelectedPriceRanges([]);
    setSelectedSort(null);
  };

  const Keyframes = () => (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-in-up {
        animation-name: fadeInUp;
        animation-duration: 650ms;
        animation-timing-function: cubic-bezier(.25,.8,.25,1);
        animation-fill-mode: both;
      }
    `}</style>
  );

  return (
    <>
      <Keyframes />

      <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 gap-8">
        <div className="flex-1 space-y-8">
          <div className="flex flex-col text-left items-start">
            <h1 className="playfair-font text-4xl md:text-[40px]">
              Available Rooms
            </h1>
            <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
              Take advantage of our limited time offers and packages.
            </p>
          </div>

          {roomsDummyData.map((room, index) => {
            const delay = index * 200;

            return (
              <article
                key={room._id}
                className="flex flex-col md:flex-row items-stretch gap-6 bg-white shadow-sm rounded-xl py-6 px-4 md:px-6"
              >
                <div
                  className="relative md:w-1/2 w-full rounded-xl overflow-hidden fade-in-up"
                  style={{
                    minHeight: 230,
                    animationDelay: `${delay}ms`,
                  }}
                >
                  <img
                    src={room.images[0]}
                    alt="Room"
                    onClick={() => {
                      navigate(`/rooms/${room._id}`);
                      scrollTo(0, 0);
                    }}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div
                  className="md:w-1/2 w-full flex flex-col justify-between fade-in-up"
                  style={{ animationDelay: `${delay + 150}ms` }}
                >
                  <div>
                    <p className="text-gray-500 text-sm">{room.hotel.city}</p>

                    <h2
                      className="text-2xl md:text-3xl playfair-font text-gray-800 cursor-pointer"
                      onClick={() => navigate(`/rooms/${room._id}`)}
                    >
                      {room.hotel.name}
                    </h2>

                    <div className="flex items-center gap-3 mt-2">
                      <StarRating rating={room.hotel.rating} />
                      <p className="text-sm text-gray-500">200+ reviews</p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                      <img src={assets.locationIcon} className="w-4 h-4" />
                      {room.hotel.address}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      {room.amenities.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-[#F5F5FF]/70 rounded-lg flex items-center gap-2"
                        >
                          <img src={facilityIcons[item]} className="h-4 w-4" />
                          <span className="text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xl font-medium text-gray-700">
                      ₹{room.pricePerNight} /night
                    </p>

                    <button
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      className="text-sm px-4 py-2 rounded-md border transition-all duration-200 hover:bg-gray-900 hover:text-white hover:scale-[1.04] cursor-pointer"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* FILTERs*/}
        <aside className="w-full max-w-sm">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <p className="text-base font-medium text-gray-800">Filters</p>
              <button
                onClick={clearFilters}
                className="hidden lg:block text-xs cursor-pointer"
              >
                Clear
              </button>

              <button
                className="lg:hidden text-xs px-3 py-1 rounded-md bg-gray-900 text-white"
                onClick={() => setOpenFilters(!openFilters)}
              >
                {openFilters ? "Hide" : "Show"}
              </button>
            </div>

            <div
              className={`${
                openFilters ? "max-h-[1000px]" : "max-h-0 lg:max-h-[1000px]"
              } overflow-hidden transition-all duration-500 px-5`}
            >
              <div className="pt-5">
                <p className="font-medium text-gray-800 pb-1">
                  Popular Filters
                </p>
                {roomTypes.map((room, index) => (
                  <CheckBox
                    key={index}
                    label={room}
                    selected={selectedRoomTypes.includes(room)}
                    onChange={toggleRoomType}
                  />
                ))}
              </div>

              <div className="pt-5">
                <p className="font-medium text-gray-800 pb-1">Price Range</p>
                {priceRange.map((range, index) => (
                  <CheckBox
                    key={index}
                    label={range}
                    selected={selectedPriceRanges.includes(range)}
                    onChange={togglePriceRange}
                  />
                ))}
              </div>

              <div className="pt-5 pb-5">
                <p className="font-medium text-gray-800 pb-1">Sort By</p>
                {sortOptions.map((option, index) => (
                  <RadioButton
                    key={index}
                    label={option}
                    selected={selectedSort === option}
                    onChange={setSelectedSort}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
