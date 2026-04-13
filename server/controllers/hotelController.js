import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { fetchUserFromClerk } from "../utils/clerkHelper.js";

// Update hotel details (name, address, contact, city, location)
export const updateHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { name, address, contact, city, manualLat, manualLng } = req.body;
        const auth = await req.auth();
        const owner = auth.userId;

        const hotel = await Hotel.findOne({ _id: hotelId, owner });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found or unauthorized" });
        }

        // Update basic fields
        if (name) hotel.name = name;
        if (address) hotel.address = address;
        if (contact) hotel.contact = contact;
        if (city) hotel.city = city;

        // Update location: manual pin takes priority, else re-geocode
        if (manualLat !== undefined && manualLng !== undefined) {
            hotel.location = { lat: parseFloat(manualLat), lng: parseFloat(manualLng) };
            console.log("📍 Updated Hotel Location (manual):", hotel.location);
        } else if (address || city) {
            try {
                const query = encodeURIComponent(`${hotel.name}, ${hotel.address}, ${hotel.city}`);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    hotel.location = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
                    console.log("📍 Re-Geocoded Hotel Location:", hotel.location);
                }
            } catch (err) {
                console.log("⚠️ Re-geocoding failed:", err.message);
            }
        }

        await hotel.save();
        res.json({ success: true, message: "Hotel updated successfully", hotel });
    } catch (error) {
        console.error("UPDATE HOTEL ERROR:", error);
        res.json({ success: false, message: error.message });
    }
};

export const registerHotel=async(req,res)=>{
    try{
        const {name,address,contact,city, manualLat, manualLng}=req.body;
        const auth = await req.auth();
        const owner=auth.userId;

        if (!owner) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        // Ensure user exists in database before updating role
        let user = await User.findById(owner);
        if (!user) {
            // Try to fetch from Clerk and create user
            const clerkUserData = await fetchUserFromClerk(owner);
            if (clerkUserData && clerkUserData.email) {
                user = await User.create(clerkUserData);
                console.log(`✅ User created in database from Clerk API: ${clerkUserData.email}`);
            } else {
                return res.status(400).json({
                    success: false,
                    message: "User not found. Please try again."
                });
            }
        }

        let location = undefined;
        if (manualLat !== undefined && manualLng !== undefined) {
             location = { lat: parseFloat(manualLat), lng: parseFloat(manualLng) };
             console.log("📍 Using Manual Hotel Location:", location);
        } else {
            // Automatically geocode the hotel address using OpenStreetMap
            try {
                const query = encodeURIComponent(`${name}, ${address}, ${city}`);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    location = {
                        lat: parseFloat(geoData[0].lat),
                        lng: parseFloat(geoData[0].lon)
                    };
                    console.log("📍 Successfully Geocoded Hotel Location:", location);
                }
            } catch (err) {
                console.log("⚠️ Geocoding failed, continuing without map coords:", err.message);
            }
        }

        // Create hotel
        await Hotel.create({name, address, contact, city, owner, location})

        // Update user role to hotelOwner
        await User.findByIdAndUpdate(owner, {role: "hotelOwner"}, {new: true})
        
        res.json({success: true, message: "Hotel registered successfully"})
    }catch(error){
        console.error("REGISTER HOTEL ERROR:", error);
        res.json({success:false,message: error.message})
    }
}

// Get all distinct cities from hotels
export const getCities = async (req, res) => {
    try {
        const cities = await Hotel.distinct("city");
        // Filter out null/undefined/empty values and sort alphabetically
        const validCities = cities
            .filter(city => city && city.trim())
            .map(city => city.trim())
            .sort();
        res.json({ success: true, cities: validCities });
    } catch (error) {
        console.error("GET CITIES ERROR:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get all hotels owned by the logged-in user
export const getOwnerHotels = async (req, res) => {
    try {
        const auth = await req.auth();
        const owner = auth.userId;
        if (!owner) return res.status(401).json({ success: false, message: "Unauthorized" });

        const hotels = await Hotel.find({ owner });
        res.json({ success: true, hotels });
    } catch (error) {
        console.error("GET OWNER HOTELS ERROR:", error);
        res.json({ success: false, message: error.message });
    }
};