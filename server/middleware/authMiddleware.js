import User from "../models/User.js";
import { fetchUserFromClerk } from "../utils/clerkHelper.js";

//middleware to check if user is authenticated

export const protect=async(req,res,next)=>{
    const auth = await req.auth();
    const{userId}=auth;
    if(!userId){
        return res.json({success: false,message: "not authenticated"})
    }else{
        let user=await User.findById(userId)
        
        // If user not found in database, try to fetch from Clerk and create
        if (!user) {
            try {
                const clerkUserData = await fetchUserFromClerk(userId);
                if (clerkUserData && clerkUserData.email) {
                    user = await User.create(clerkUserData);
                    console.log(`✅ User created in database from Clerk API: ${clerkUserData.email}`);
                }
            } catch (error) {
                console.error("❌ Error fetching user from Clerk API:", error.message);
            }
        }
        
        req.user=user
        next()
    }
}