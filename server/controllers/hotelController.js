import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { fetchUserFromClerk } from "../utils/clerkHelper.js";

export const registerHotel=async(req,res)=>{
    try{
        const {name,address,contact,city}=req.body;
        const auth = await req.auth();
        const owner=auth.userId; // ✅ Clerk user

        if (!owner) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        //check if user already registered
        const hotel=await Hotel.findOne({owner})
        if(hotel){
            return res.json({success: false,message: "Hotel already registered"})
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

        // Create hotel
        await Hotel.create({name,address,contact,city,owner})

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