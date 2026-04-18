import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.DEV ? "http://localhost:3000" : import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = "₹";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [ownerHotels, setOwnerHotels] = useState([]);

  // Load searchedCities from sessionStorage for non-logged-in users
  useEffect(() => {
    if (!user) {
      try {
        const stored = sessionStorage.getItem('searchedCities');
        if (stored) {
          const cities = JSON.parse(stored);
          if (Array.isArray(cities) && cities.length > 0) {
            setSearchedCities(cities);
          }
        }
      } catch (error) {
        console.error("Failed to load searched cities from sessionStorage:", error);
      }
    }
  }, []);

  // Save searchedCities to sessionStorage for non-logged-in users
  useEffect(() => {
    if (!user && searchedCities.length > 0) {
      try {
        sessionStorage.setItem('searchedCities', JSON.stringify(searchedCities));
      } catch (error) {
        console.error("Failed to save searched cities to sessionStorage:", error);
      }
    }
  }, [searchedCities, user]);

  const ROOMS_CACHE_KEY = "travesia_rooms_cache";
  const ROOMS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Read cached rooms from localStorage — returns null if missing/expired
  const getCachedRooms = () => {
    try {
      const raw = localStorage.getItem(ROOMS_CACHE_KEY);
      if (!raw) return null;
      const { data: rooms, timestamp } = JSON.parse(raw);
      const isExpired = Date.now() - timestamp > ROOMS_CACHE_TTL;
      return { rooms, isExpired };
    } catch {
      return null;
    }
  };

  const saveCachedRooms = (rooms) => {
    try {
      localStorage.setItem(ROOMS_CACHE_KEY, JSON.stringify({ data: rooms, timestamp: Date.now() }));
    } catch { /* quota exceeded — ignore */ }
  };

  const fetchRooms = async ({ forceRefresh = false } = {}) => {
    try {
      // 1. Serve cache immediately (stale-while-revalidate)
      const cached = getCachedRooms();
      if (cached && !forceRefresh) {
        setRooms(cached.rooms); // instant — no spinner
        if (!cached.isExpired) return; // Fresh — skip network call
        // Stale — continue to re-fetch silently in background
      }

      // 2. Fetch fresh data from server
      const { data } = await axios.get("/api/rooms");
      if (data.success) {
        setRooms(data.rooms);
        saveCachedRooms(data.rooms); // update cache
      } else {
        toast.error(data.message || "Failed to fetch rooms");
      }
    } catch (error) {
      // If network fails but we have cache, stay silent — user sees cached data
      const cached = getCachedRooms();
      if (!cached) {
        toast.error(error.response?.data?.message || error.message || "Failed to fetch rooms");
      }
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get("/api/user/wishlist", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
       console.log("Failed to fetch wishlist", error);
    }
  };

  const toggleWishlist = async (roomId) => {
    if (!user) {
        toast.error("Please login to save rooms");
        return;
    }
    try {
      const inWishlist = wishlist.some(r => r._id === roomId || r === roomId);
      
      const { data } = await axios.post("/api/user/wishlist/toggle", { roomId }, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
         fetchWishlist();
         toast.success(inWishlist ? "Removed from Wishlist" : "Added to Wishlist", { icon: '❤️' });
      }
    } catch (error) {
       toast.error("Failed to update wishlist");
    }
  };

  const fetchOwnerHotels = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get("/api/hotels/my", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setOwnerHotels(data.hotels);
      }
    } catch (error) {
      console.log("Failed to fetch owner hotels");
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        // Only update searchedCities if we got data from backend
        if (data.recentSearchedCities && Array.isArray(data.recentSearchedCities)) {
          setSearchedCities(data.recentSearchedCities);
        }
      } else {
        setTimeout(fetchUser, 5000);
      }
    } catch (error) {
      // Don't show error toast for user fetch, just retry silently
      setTimeout(fetchUser, 5000);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUser();
      fetchWishlist();
      // Clear sessionStorage when user logs in (use backend data instead)
      sessionStorage.removeItem('searchedCities');
    } else {
      // Clear data when user logs out
      setIsOwner(false);
      setWishlist([]);
      setOwnerHotels([]);
    }
  }, [user]);

  useEffect(() => {
    if (isOwner) {
      fetchOwnerHotels();
    }
  }, [isOwner]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
    fetchRooms,
    fetchUser,
    wishlist,
    toggleWishlist,
    ownerHotels,
    fetchOwnerHotels,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);