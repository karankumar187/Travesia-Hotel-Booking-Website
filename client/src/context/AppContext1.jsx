import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.DEV ? "http://localhost:3000" : import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
const ls = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  },
  del: (key) => { try { localStorage.removeItem(key); } catch { } },
};

// ─── Cache config ─────────────────────────────────────────────────────────────
const ROOMS_TTL    = 5 * 60 * 1000;  // 5 min
const USER_TTL     = 10 * 60 * 1000; // 10 min
const WISHLIST_TTL = 5 * 60 * 1000;  // 5 min

const cacheKey = {
  rooms:    () => "tv_rooms",
  user:     (uid) => `tv_user_${uid}`,
  wishlist: (uid) => `tv_wishlist_${uid}`,
  cities:   (uid) => `tv_cities_${uid}`,
};

const readCache = (key, ttl) => {
  const entry = ls.get(key);
  if (!entry) return { data: null, stale: true };
  const stale = Date.now() - entry.ts > ttl;
  return { data: entry.data, stale };
};

const writeCache = (key, data) => ls.set(key, { data, ts: Date.now() });

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }) => {
  const currency = "₹";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const uid = user?.id ?? null;

  // ── Hydrate from localStorage instantly ──────────────────────────────────────
  const [isOwner, setIsOwner] = useState(() => {
    if (!uid) return false;
    return ls.get(cacheKey.user(uid))?.isOwner ?? false;
  });

  const [searchedCities, setSearchedCities] = useState(() => {
    if (!uid) {
      return ls.get("tv_cities_guest") ?? [];
    }
    return ls.get(cacheKey.cities(uid)) ?? [];
  });

  const [showHotelReg, setShowHotelReg] = useState(false);

  const [rooms, setRooms] = useState(() => {
    const { data } = readCache(cacheKey.rooms(), ROOMS_TTL);
    return data ?? [];
  });

  const [wishlist, setWishlist] = useState(() => {
    if (!uid) return [];
    const { data } = readCache(cacheKey.wishlist(uid), WISHLIST_TTL);
    return data ?? [];
  });

  const [ownerHotels, setOwnerHotels] = useState([]);

  // ── Rooms ─────────────────────────────────────────────────────────────────────
  const fetchRooms = async ({ forceRefresh = false } = {}) => {
    try {
      const { data: cached, stale } = readCache(cacheKey.rooms(), ROOMS_TTL);
      if (cached && !forceRefresh) {
        setRooms(cached);
        if (!stale) return; // fresh — skip network
        // stale — fall through to background refresh
      }
      const { data } = await axios.get("/api/rooms");
      if (data.success) {
        setRooms(data.rooms);
        writeCache(cacheKey.rooms(), data.rooms);
      } else {
        toast.error(data.message || "Failed to fetch rooms");
      }
    } catch (error) {
      const { data: cached } = readCache(cacheKey.rooms(), ROOMS_TTL);
      if (!cached) toast.error(error.response?.data?.message || error.message || "Failed to fetch rooms");
    }
  };

  // ── Wishlist ──────────────────────────────────────────────────────────────────
  const fetchWishlist = async () => {
    if (!uid) return;
    try {
      const { data } = await axios.get("/api/user/wishlist", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        const list = data.wishlist || [];
        setWishlist(list);
        writeCache(cacheKey.wishlist(uid), list);
      }
    } catch (error) {
      console.log("Failed to fetch wishlist", error);
    }
  };

  const toggleWishlist = async (roomId) => {
    if (!uid) { toast.error("Please login to save rooms"); return; }
    try {
      const inWishlist = wishlist.some(r => r._id === roomId || r === roomId);
      const { data } = await axios.post("/api/user/wishlist/toggle", { roomId }, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        fetchWishlist();
        toast.success(inWishlist ? "Removed from Wishlist" : "Added to Wishlist", { icon: "❤️" });
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  // ── Owner Hotels ──────────────────────────────────────────────────────────────
  const fetchOwnerHotels = async () => {
    if (!uid) return;
    try {
      const { data } = await axios.get("/api/hotels/my", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setOwnerHotels(data.hotels);
    } catch {
      console.log("Failed to fetch owner hotels");
    }
  };

  // ── User profile ──────────────────────────────────────────────────────────────
  const fetchUser = async () => {
    if (!uid) return;
    try {
      // Hydrate from cache instantly before the API responds
      const { data: cached, stale } = readCache(cacheKey.user(uid), USER_TTL);
      if (cached) {
        setIsOwner(cached.isOwner);
        if (cached.cities?.length) setSearchedCities(cached.cities);
        if (!stale) return; // fresh — skip network
      }

      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        const isOwnerNow = data.role === "hotelOwner";
        setIsOwner(isOwnerNow);
        const cities = data.recentSearchedCities ?? [];
        if (cities.length) setSearchedCities(cities);
        // Persist to cache
        writeCache(cacheKey.user(uid), { isOwner: isOwnerNow, cities });
        ls.set(cacheKey.cities(uid), cities);
      } else {
        setTimeout(fetchUser, 5000);
      }
    } catch {
      setTimeout(fetchUser, 5000);
    }
  };

  // ── Persist searchedCities ────────────────────────────────────────────────────
  useEffect(() => {
    if (uid) {
      ls.set(cacheKey.cities(uid), searchedCities);
    } else {
      ls.set("tv_cities_guest", searchedCities);
    }
  }, [searchedCities, uid]);

  // ── Login / logout effect ─────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchUser();
      // Hydrate wishlist from cache instantly, then verify in background
      const { data: cachedWishlist, stale } = readCache(cacheKey.wishlist(uid), WISHLIST_TTL);
      if (cachedWishlist) setWishlist(cachedWishlist);
      if (stale || !cachedWishlist) fetchWishlist();
      sessionStorage.removeItem("searchedCities");
    } else {
      // Logout — clear user-specific data
      setIsOwner(false);
      setWishlist([]);
      setOwnerHotels([]);
    }
  }, [user]);

  useEffect(() => {
    if (isOwner) fetchOwnerHotels();
  }, [isOwner]);

  // ── Initial rooms load ────────────────────────────────────────────────────────
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