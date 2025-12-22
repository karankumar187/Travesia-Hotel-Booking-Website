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
        const user=req.user;

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchedCities)

        }else{
            user.recentSearchedCities.shift()
            user.recentSearchedCities.push(recentSearchedCities)
        }
        await user.save()
        res.json({success: true,message: "city added"})

    }catch(error){
        console.error("STORE RECENT SEARCHED CITIES ERROR:", error);
        res.json({success: false,message: error.message})
    }
}