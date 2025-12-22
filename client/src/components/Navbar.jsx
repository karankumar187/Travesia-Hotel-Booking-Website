import React, { use, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link,  useLocation } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext1";
import Dashboard from "../pages/hotelOwner/Dashboard";

const BookIcon = () => (
  <svg
    className="w-4 h-4 text-gray-700"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experience", path: "/experience" },
    { name: "About", path: "/about" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchDestination, setSearchDestination] = useState("");
  const [cities, setCities] = useState([]);

  const { openSignIn } = useClerk();
  
  const location = useLocation();

  const{user,navigate,isOwner,setShowHotelReg,setSearchedCities,getToken,axios}=useAppContext()

  // Fetch cities from backend
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data } = await axios.get("/api/hotels/cities");
        if (data.success) {
          setCities(data.cities || []);
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        // Keep empty array if fetch fails - search will still work for any city
      }
    };
    fetchCities();
  }, [axios]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchDestination || !searchDestination.trim()) {
      return;
    }

    const trimmedDestination = searchDestination.trim();

    // Update searched cities
    setSearchedCities((prev) => {
      const cityExists = prev.some(
        (city) => city && city.toLowerCase().trim() === trimmedDestination.toLowerCase()
      );
      
      if (cityExists) {
        const filtered = prev.filter(
          (city) => city && city.toLowerCase().trim() !== trimmedDestination.toLowerCase()
        );
        return [...filtered, trimmedDestination];
      }
      
      const updatedSearchedCities = [...prev, trimmedDestination];
      if (updatedSearchedCities.length > 3) {
        updatedSearchedCities.shift();
      }
      return updatedSearchedCities;
    });

    navigate(`/rooms?destination=${trimmedDestination}`);
    setIsSearchOpen(false);
    setSearchDestination("");

    // Try to store in backend (only if user is logged in)
    try {
      const token = await getToken();
      if (token) {
        await axios.post(
          "/api/user/store-recent-search",
          { recentSearchedCities: trimmedDestination },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Failed to store recent search:", error);
    }
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    } else {
      setIsScrolled(false);
    }
    setIsScrolled((prev) => (location.pathname !== "/" ? true : prev));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Close search when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen) {
        const searchDropdown = event.target.closest('[data-search-dropdown]');
        const searchIcon = event.target.closest('[data-search-icon]');
        if (!searchDropdown && !searchIcon) {
          setIsSearchOpen(false);
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
        isScrolled
          ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
          : "py-4 md:py-6"
      }`}
    >
      {/* Logo */}
      <Link to={"/"} className="flex items-center gap-2">
        <img
          src={assets.logo}
          alt="Logo"
          className={`${isScrolled && "opacity-80 invert brightness-0"} h-11 brightness-250`}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <a
            key={i}
            href={link.path}
            className={`group flex flex-col gap-0.5 ${
              isScrolled ? "text-gray-700" : "text-white"
            }`}
          >
            {link.name}
            <div
              className={`${
                isScrolled ? "bg-gray-700" : "bg-white"
              } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </a>
        ))}
      {user && (
  <button
    className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
      isScrolled ? "text-black" : "text-white"
    } transition-all`}
    onClick={() => {
      if (isOwner) {
        navigate("/owner");
      } else {
        setShowHotelReg(true);
      }
    }}
  >
    {isOwner ? "Dashboard" : "List your Hotel"}
  </button>
)}

      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        <div className="relative" data-search-dropdown>
          <img
            src={assets.searchIcon}
            alt="search"
            data-search-icon
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`h-7 transition-all duration-500 cursor-pointer ${
              isScrolled ? "invert brightness-75" : ""
            }`}
          />
          
          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50" data-search-dropdown>
              <form onSubmit={handleSearch} className="space-y-3">
                <div>
                  <label htmlFor="navbar-search" className="text-sm font-medium text-gray-700 mb-2 block">
                    Search Destination
                  </label>
                  <input
                    id="navbar-search"
                    list="navbar-destinations"
                    type="text"
                    placeholder="Where to?"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <datalist id="navbar-destinations">
                    {cities.map((city, i) => (
                      <option key={i} value={city} />
                    ))}
                  </datalist>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchDestination("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() => navigate("/my-bookings")}
              ></UserButton.Action>
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
              isScrolled ? "text-white bg-black" : "bg-white text-black"
            } cursor-pointer`}
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="relative" data-search-dropdown>
          <img
            src={assets.searchIcon}
            alt="search"
            data-search-icon
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`h-6 transition-all duration-500 cursor-pointer ${
              isScrolled ? "invert brightness-75" : ""
            }`}
          />
          
          {/* Mobile Search Dropdown */}
          {isSearchOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4" onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}>
              <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 p-4" data-search-dropdown>
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="mobile-navbar-search" className="text-sm font-medium text-gray-700">
                      Search Destination
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchDestination("");
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    id="mobile-navbar-search"
                    list="mobile-navbar-destinations"
                    type="text"
                    placeholder="Where to?"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <datalist id="mobile-navbar-destinations">
                    {cities.map((city, i) => (
                      <option key={i} value={city} />
                    ))}
                  </datalist>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {user && (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() => navigate("/my-bookings")}
              ></UserButton.Action>
            </UserButton.MenuItems>
          </UserButton>
        )}
        <img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          src={assets.menuIcon}
          alt=""
          className={`${isScrolled && "inverted"} h-4 cursor-pointer`}
        />
      </div>

      {/* Mobile Menu */}

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={assets.closeIcon} alt="" className={`h-6.5`} />
        </button>

        {navLinks.map((link, i) => (
          <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
            {link.name}
          </a>
        ))}

        {user && (
  <button
    className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
    onClick={() => {
      if (isOwner) {
        navigate("/owner");
      } else {
        setShowHotelReg(true);
      }
    }}
  >
     {isOwner ? "Dashboard" : "List your Hotel"}
  </button>
)}


        

        {!user && (
          <button
            onClick={openSignIn}
            className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500 cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;