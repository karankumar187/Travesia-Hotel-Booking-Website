import React from "react";
import { assets } from "../assets/assets";
import { cities } from "../assets/assets";
import { useState } from "react";
import { useAppContext } from "../context/AppContext1";

export default function Hero() {

  const {axios, navigate, setSearchedCities, getToken} = useAppContext()
  const [destination, setDestination] = useState('')

  const onSearch = async (e) => {
  e.preventDefault();

  navigate(`/rooms?destination=${destination}`);

  try {
    // Store recent searched city
    await axios.post(
      "/api/user/store-recent-search",
      { recentSearchedCities: destination },
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      }
    );

    // Update searched cities (max 3)
    setSearchedCities((prev) => {
      const updatedSearchedCities = [...prev, destination];
      if (updatedSearchedCities.length > 3) {
        updatedSearchedCities.shift();
      }
      return updatedSearchedCities;
    });
  } catch (error) {
    console.error("Failed to store recent search:", error);
  }
};


  return (
    <div className="flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white h-[60vh] bg-heroBg bg-cover bg-[url('/src/assets/bg1.png')] bg-center bg-no-repeat bg-cover h-screen">
      <p className="bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20">
        Your Home in Every Journey
      </p>
      <h1 className="playfair-font text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4">
        Find Your Ideal Stay in Every Destination
      </h1>
      <p className="max-w-130 mt-2 text-sm md:text-base">
        From cozy apartments to luxury suites, Travesía helps you find spaces
        that feel personal, warm, and welcoming.
      </p>
      <form
        onSubmit={onSearch}
        className="relative bg-white/95 text-gray-700 rounded-2xl px-5 py-4 mt-8 flex flex-col md:flex-row gap-4 items-start md:items-end max-w-5xl shadow-2xl border border-white/30"
      >
        {/* CSS for animations (kept local and small) */}
        <style>{`
        @keyframes fadeUp {
        0% { transform: translateY(10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
        }
        .fade-up { animation: fadeUp 420ms ease forwards; }
        .focus-lift:focus { transform: translateY(-3px) scale(1.001); box-shadow: 0 10px 25px rgba(99,102,241,0.06); }
        .btn-glow { transition: transform .18s ease, box-shadow .18s ease; }
        .btn-glow:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px rgba(0,0,0,0.16); }
        @keyframes pulseSoft {
        0% { box-shadow: 0 0 0 0 rgba(255,140,0,0.12); }
        70% { box-shadow: 0 0 0 12px rgba(255,140,0,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,140,0,0); }
        }
        .sun-pulse { animation: pulseSoft 3.2s infinite; }
        `}</style>

        {/* Destination */}
        <div
          className="flex-1 min-w-[180px] fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <img
              src={assets.calenderIcon}
              alt="calendar"
              className="h-4 w-4 opacity-85"
            />
            <label htmlFor="destinationInput">Destination</label>
          </div>
          <input
            list="destinations"
            id="destinationInput"
            name="destinationInput"
            type="text"
            placeholder="Where to?"
            required
            onChange={e => setDestination(e.target.value)} value={destination}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-transform duration-150 focus:shadow-md focus:border-[#49B9FF]/60 focus:ring-0 focus-lift"
          />
          <datalist id="destinations">
            {cities.map((city, i) => (
              <option key={i} value={city} />
            ))}
          </datalist>
        </div>

        {/* Check in */}
        <div
          className="min-w-[160px] fade-up"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <img
              src={assets.calenderIcon}
              alt="calendar"
              className="h-4 w-4 opacity-85"
            />
            <label htmlFor="checkIn">Check in</label>
          </div>
          <input
            id="checkIn"
            name="checkIn"
            type="date"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-transform duration-150 focus:shadow-md focus:border-[#49B9FF]/60 focus:ring-0 focus-lift"
          />
        </div>

        {/* Check out */}
        <div
          className="min-w-[160px] fade-up"
          style={{ animationDelay: "0.18s" }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <img
              src={assets.calenderIcon}
              alt="calendar"
              className="h-4 w-4 opacity-85"
            />
            <label htmlFor="checkOut">Check out</label>
          </div>
          <input
            id="checkOut"
            name="checkOut"
            type="date"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-transform duration-150 focus:shadow-md focus:border-[#49B9FF]/60 focus:ring-0 focus-lift"
          />
        </div>

        {/* Guests */}
        <div
          className="flex items-start md:items-center gap-2 fade-up"
          style={{ animationDelay: "0.24s" }}
        >
          <div className="flex flex-col">
            <label
              htmlFor="guests"
              className="text-sm font-medium text-gray-600"
            >
              Guests
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min={1}
              max={8}
              defaultValue={1}
              className="mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none w-24 transition-transform duration-150 focus:shadow-md focus:border-[#49B9FF]/60 focus:ring-0 focus-lift"
            />
          </div>
        </div>

        {/* Search button */}
        <div
          className="md:flex-shrink-0 fade-up"
          style={{ animationDelay: "0.30s" }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0f172a] to-black text-white px-5 py-3 font-semibold shadow-lg btn-glow"
            title="Search"
          >
            <span className="sun-pulse flex items-center justify-center rounded-full p-0.5">
              <img src={assets.searchIcon} alt="search" className="h-6 w-6" />
            </span>
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}
