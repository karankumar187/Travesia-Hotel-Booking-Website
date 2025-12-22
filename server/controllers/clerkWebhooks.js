import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        // Svix instance with clerk webhook 
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        // Getting headers 
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        }
        // Verifing Headers 
        await whook.verify(JSON.stringify(req.body), headers)
        // Getting data from req body 
        const {data, type} = req.body

        // Check if email addresses exist
        if (!data.email_addresses || data.email_addresses.length === 0) {
            return res.json({success: false, message: "No email address found"});
        }

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: (data.first_name || "") + " " + (data.last_name || ""),
            image: data.image_url || "",
        }

        // Switch case for different events 
        switch (type) {
            case "user.created": {
                await User.create(userData)
                break
            }

            case "user.updated": {
                await User.findByIdAndUpdate(data.id, userData)
                break
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id)
                break
            }

            default:
                break;
        }

        res.json({success: true, message : "Webhook Recieved"})

    } catch (error) {
        console.error("CLERK WEBHOOK ERROR:", error.message)
        res.json({success: false, message: error.message})
    }
}

export default clerkWebhooks