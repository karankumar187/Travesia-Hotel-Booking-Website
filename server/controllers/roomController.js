//api to create a new room for hotel
import { cloudinary } from "../configs/cloudinaryApi.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { cacheGet, cacheSet, cacheDel, KEYS, TTL } from "../utils/cache.js";

export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities, hotelId } = req.body;

    const auth = await req.auth();
    if (!hotelId) {
      return res.json({ success: false, message: "Hotel ID is required" });
    }
    const hotel = await Hotel.findOne({ _id: hotelId, owner: auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No matching hotel found or unauthorized" });
    }

    // SAFETY CHECK
    if (!req.files || req.files.length === 0) {
      return res.json({ success: false, message: "No images uploaded" });
    }

    // CLOUDINARY UPLOAD
    const uploadImages = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "rooms",
      });
      return result.secure_url;
    });

    const images = await Promise.all(uploadImages);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: Number(pricePerNight),
      amenities: JSON.parse(amenities),
      images,
      isAvailable: true,
    });

    // Invalidate stale caches
    await cacheDel([KEYS.rooms(), KEYS.roomsByHotel(hotel._id.toString())]);

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};


//api to get all rooms
import Review from "../models/Review.js";

export const getRooms = async (req, res) => {
    try {
        // 1. Cache hit
        const cached = await cacheGet(KEYS.rooms());
        if (cached) return res.json({ success: true, rooms: cached });

        // 2. DB query
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: { path: 'owner', select: 'username email image' }
        }).sort({ createdAt: -1 });

        const hotelObjectIds = [...new Set(rooms.map(r => r.hotel._id))];
        const hotelIdStrings = hotelObjectIds.map(id => id.toString());
        const reviews = await Review.find({ hotel: { $in: hotelObjectIds } });

        const hotelStats = {};
        hotelIdStrings.forEach(id => { hotelStats[id] = { totalReviews: 0, averageRating: 0 }; });
        reviews.forEach(r => {
            const id = r.hotel.toString();
            if (hotelStats[id]) { hotelStats[id].totalReviews++; hotelStats[id].averageRating += r.rating; }
        });

        const roomsWithStats = rooms.map(room => {
            const id = room.hotel._id.toString();
            const stats = hotelStats[id] || { totalReviews: 0, averageRating: 0 };
            const avg = stats.totalReviews > 0 ? Math.round((stats.averageRating / stats.totalReviews) * 10) / 10 : 0;
            return { ...room.toObject(), hotel: { ...room.hotel.toObject(), reviewStats: { totalReviews: stats.totalReviews, averageRating: avg } } };
        });

        // 3. Cache result
        await cacheSet(KEYS.rooms(), roomsWithStats, TTL.rooms);
        res.json({ success: true, rooms: roomsWithStats });
    } catch (error) {
        console.error("GET ROOMS ERROR:", error);
        res.json({ success: false, message: error.message });
    }
}


//api to get all rooms for a specific hotel
export const getOwnerRooms=async(req,res)=>{
    try{
        const auth = await req.auth();
        const hotels = await Hotel.find({owner: auth.userId});
        if (!hotels || hotels.length === 0) {
            return res.json({ success: true, rooms: [] });
        }
        const hotelIds = hotels.map(h => h._id.toString());
        const rooms=await Room.find({hotel: { $in: hotelIds }}).populate("hotel");
        res.json({success: true,rooms})

    }catch(error){
        console.error("GET OWNER ROOMS ERROR:", error);
        res.json({success: false,message: error.message})
    }
}


//api to toggle availability of a room
export const toggleRoomAvailability=async(req,res)=>{
    try{
        const{roomId}=req.body;
        if (!roomId) {
            return res.json({ success: false, message: "Room ID is required" });
        }
        const roomData=await Room.findById(roomId);
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        await cacheDel([KEYS.rooms(), KEYS.roomsByHotel(roomData.hotel.toString())]);
        res.json({ success: true, message: "room availability updated" })
 
    }catch(error){
        console.error("TOGGLE ROOM AVAILABILITY ERROR:", error);
        res.json({success: false,message: error.message})
    }
}

// Public: get all rooms for a specific hotel (for room type picker on RoomDetails & HotelManage)
export const getRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const cached = await cacheGet(KEYS.roomsByHotel(hotelId));
        if (cached) return res.json({ success: true, rooms: cached });

        const rooms = await Room.find({ hotel: hotelId }).populate("hotel");
        await cacheSet(KEYS.roomsByHotel(hotelId), rooms, TTL.rooms);
        res.json({ success: true, rooms });
    } catch (error) {
        console.error("GET ROOMS BY HOTEL ERROR:", error);
        res.json({ success: false, message: error.message });
    }
}