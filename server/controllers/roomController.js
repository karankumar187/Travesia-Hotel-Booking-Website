//api to create a new room for hotel
import { cloudinary } from "../configs/cloudinaryApi.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    const auth = await req.auth();
    const hotel = await Hotel.findOne({ owner: auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No hotel found" });
    }

    // 🔥 SAFETY CHECK
    if (!req.files || req.files.length === 0) {
      return res.json({ success: false, message: "No images uploaded" });
    }

    // 🔥 CLOUDINARY UPLOAD
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

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};


//api to get all rooms
export const getRooms=async(req,res)=>{
    try{
        const rooms=await Room.find({isAvailable: true}).populate({
            path: 'hotel',
            populate:{
                path: 'owner',
                select: 'username email image'
            }
            
        }).sort({createdAt: -1})
        res.json({success: true,rooms})
    }catch(error){
        console.error("GET ROOMS ERROR:", error);
        res.json({success: false,message: error.message})
    }
    
}


//api to get all rooms for a specific hotel
export const getOwnerRooms=async(req,res)=>{
    try{
        const auth = await req.auth();
        const hotelData=await Hotel.findOne({owner: auth.userId})
        if (!hotelData) {
            return res.json({ success: false, message: "No hotel found" });
        }
        const rooms=await Room.find({hotel: hotelData._id.toString()}).populate("hotel");
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
        roomData.isAvailable=!roomData.isAvailable;
        await roomData.save()
        res.json({success: true,message: "room availability updated"})
 
    }catch(error){
        console.error("TOGGLE ROOM AVAILABILITY ERROR:", error);
        res.json({success: false,message: error.message})
    }
}