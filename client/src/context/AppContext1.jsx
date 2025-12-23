import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);

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

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) setRooms(data.rooms);
      else toast.error(data.message || "Failed to fetch rooms");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to fetch rooms");
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
      // Clear sessionStorage when user logs in (use backend data instead)
      sessionStorage.removeItem('searchedCities');
    } else {
      // Clear isOwner when user logs out
      setIsOwner(false);
    }
  }, [user]);

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
    fetchUser, // Expose fetchUser so components can refresh user data
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);