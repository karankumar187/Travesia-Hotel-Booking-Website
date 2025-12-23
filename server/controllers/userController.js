//GET /api/user

import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const getUserData=async(req,res)=>{
    try{
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if user has a hotel registered (more reliable than just checking role)
        const hotel = await Hotel.findOne({ owner: req.user._id });
        
        // If user has a hotel, they are a hotel owner (update role if needed)
        let role = req.user.role;
        if (hotel && role !== "hotelOwner") {
            // Update role in database if it's not set correctly
            await User.findByIdAndUpdate(req.user._id, { role: "hotelOwner" });
            role = "hotelOwner";
        } else if (!hotel && role === "hotelOwner") {
            // If no hotel but role is hotelOwner, reset to user
            await User.findByIdAndUpdate(req.user._id, { role: "user" });
            role = "user";
        }
        
        const recentSearchedCities=req.user.recentSearchedCities;
        res.json({success: true,role,recentSearchedCities})

    }catch(error){
        console.error("GET USER DATA ERROR:", error);
        res.json({success: false,message: error.message})
    }
}

//store user recent searched cities
export const storeRecentSearchedCities=async(req,res)=>{
    try{
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const{recentSearchedCities}=req.body 
        if (!recentSearchedCities || !recentSearchedCities.trim()) {
            return res.status(400).json({
                success: false,
                message: "City name is required"
            });
        }

        const trimmedCity = recentSearchedCities.trim();
        const user=req.user;

        // Check if city already exists (case-insensitive)
        const cityIndex = user.recentSearchedCities.findIndex(
            (city) => city && city.toLowerCase().trim() === trimmedCity.toLowerCase()
        );

        if (cityIndex !== -1) {
            // City exists, move it to the end
            user.recentSearchedCities.splice(cityIndex, 1);
            user.recentSearchedCities.push(trimmedCity);
        } else {
            // City doesn't exist, add it
            if(user.recentSearchedCities.length < 3){
                user.recentSearchedCities.push(trimmedCity);
            } else {
                user.recentSearchedCities.shift();
                user.recentSearchedCities.push(trimmedCity);
            }
        }
        
        await user.save();
        res.json({
            success: true,
            message: "city added",
            recentSearchedCities: user.recentSearchedCities
        });

    }catch(error){
        console.error("STORE RECENT SEARCHED CITIES ERROR:", error);
        res.json({success: false,message: error.message})
    }
}