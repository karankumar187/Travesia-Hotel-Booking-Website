import { useSearchParams } from "react-router-dom";
import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext1";

/* -------------------- Checkbox -------------------- */
const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex items-center gap-3 cursor-pointer mt-3 text-sm">
    <input
      type="checkbox"
      checked={selected}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />

    <span
      className={`flex items-center justify-center w-5 h-5 rounded-md border transition-colors duration-150
        ${selected ? "bg-gray-900 border-gray-900" : "bg-white border-gray-300"}`}
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

/* -------------------- Radio Button -------------------- */
const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex items-center gap-3 cursor-pointer mt-3 text-sm">
    <input
      type="radio"
      name="sortOption"
      checked={selected}
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

/* ==================== MAIN COMPONENT ==================== */
export default function AllRooms() {
  const [openFilters, setOpenFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, navigate, currency } = useAppContext();

  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  });

  const [selectedSort, setSelectedSort] = useState("");

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const priceRange = ["0 to 500", "500 to 1000", "1000 to 3000", "3000 to 5000"];
  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First",
  ];

  /* -------------------- Filter Handlers -------------------- */
  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      updated[type] = checked
        ? [...updated[type], value]
        : updated[type].filter((item) => item !== value);
      return updated;
    });
  };

  const handleSortChange = (sort) => setSelectedSort(sort);

  /* -------------------- Filter Logic -------------------- */
  const matchesRoomType = (room) =>
    selectedFilters.roomType.length === 0 ||
    selectedFilters.roomType.includes(room.roomType);

  const matchesPriceRange = (room) =>
    selectedFilters.priceRange.length === 0 ||
    selectedFilters.priceRange.some((range) => {
      const [min, max] = range.split(" to ").map(Number);
      return room.pricePerNight >= min && room.pricePerNight <= max;
    });

  const filterDestination = (room) => {
    const destination = searchParams.get("destination");
    if (!destination) return true;
    return room.hotel.city
      .toLowerCase()
      .includes(destination.toLowerCase());
  };

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High")
      return a.pricePerNight - b.pricePerNight;
    if (selectedSort === "Price High to Low")
      return b.pricePerNight - a.pricePerNight;
    if (selectedSort === "Newest First")
      return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  };

  /* -------------------- Memoized Rooms -------------------- */
  const filteredRooms = useMemo(() => {
    return rooms
      .filter(
        (room) =>
          matchesRoomType(room) &&
          matchesPriceRange(room) &&
          filterDestination(room)
      )
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, searchParams]);

  /* -------------------- Clear Filters -------------------- */
  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priceRange: [] });
    setSelectedSort("");
    setSearchParams({});
  };

  /* -------------------- Animations -------------------- */
  const Keyframes = () => (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in-up {
        animation: fadeInUp 650ms cubic-bezier(.25,.8,.25,1) both;
      }
    `}</style>
  );

  return (
    <>
      <Keyframes />

      <div className="flex flex-col-reverse lg:flex-row gap-8 pt-28 px-4 md:px-16 lg:px-24">
        {/* ROOMS */}
        <div className="flex-1 space-y-8">
          {filteredRooms.map((room, index) => (
            <article
              key={room._id}
              className="flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow-sm p-6 fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="md:w-1/2 overflow-hidden rounded-xl">
                <img
                  src={room.images[0]}
                  alt=""
                  onClick={() => navigate(`/rooms/${room._id}`)}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-700 hover:scale-105"
                />
              </div>

              <div className="md:w-1/2 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-500">{room.hotel.city}</p>
                  <h2
                    className="text-3xl playfair-font cursor-pointer"
                    onClick={() => navigate(`/rooms/${room._id}`)}
                  >
                    {room.hotel.name}
                  </h2>

                  <div className="flex items-center gap-3 mt-2">
                    <StarRating rating={room.hotel.rating} />
                    <p className="text-sm text-gray-500">200+ reviews</p>
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
                  <p className="text-xl font-medium">
                    {currency} {room.pricePerNight} / night
                  </p>
                  <button
                    onClick={() => navigate(`/rooms/${room._id}`)}
                    className="border px-4 py-2 rounded-md hover:bg-gray-900 hover:text-white transition"
                  >
                    Book
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* FILTERS */}
        <aside className="w-full max-w-sm">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="flex justify-between px-5 py-3 border-b">
              <p className="font-medium">Filters</p>
              <button onClick={clearFilters} className="text-xs">
                Clear
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="font-medium">Room Type</p>
              {roomTypes.map((type) => (
                <CheckBox
                  key={type}
                  label={type}
                  selected={selectedFilters.roomType.includes(type)}
                  onChange={(checked) =>
                    handleFilterChange(checked, type, "roomType")
                  }
                />
              ))}

              <p className="font-medium mt-5">Price Range</p>
              {priceRange.map((range) => (
                <CheckBox
                  key={range}
                  label={`${currency} ${range}`}
                  selected={selectedFilters.priceRange.includes(range)}
                  onChange={(checked) =>
                    handleFilterChange(checked, range, "priceRange")
                  }
                />
              ))}

              <p className="font-medium mt-5">Sort By</p>
              {sortOptions.map((option) => (
                <RadioButton
                  key={option}
                  label={option}
                  selected={selectedSort === option}
                  onChange={handleSortChange}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
