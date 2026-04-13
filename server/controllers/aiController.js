import Groq from "groq-sdk";
import Room from "../models/Room.js";

export const getTravelRecommendations = async (req, res) => {
    try {
        const { message } = req.body;
        if(!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        if(!process.env.GROQ_API_KEY) {
            return res.json({ success: false, reply: "AI Concierge is currently asleep. (Missing GROQ_API_KEY)"});
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const rooms = await Room.find({ isAvailable: true }).populate('hotel');
        
        const roomsContext = rooms.map(r => 
            `Hotel: ${r.hotel?.name || 'Unknown'} in ${r.hotel?.city || 'Unknown'}. Type: ${r.roomType}. Price: ${r.pricePerNight}/night. Amenities: ${r.amenities.join(', ')}`
        ).join("\n");

        const prompt = `You are an AI Travel Concierge for "Travesia", a hotel booking platform.
The user is asking: "${message}"

Here is the list of available rooms in the database:
${roomsContext}

Based on the user's message, recommend 1 to 3 rooms from the database that best match what they are looking for. 
Be conversational, brief, and helpful. Mention the Hotel name, city, and why it's a good match.
Do not hallucinate any rooms that are not in the list.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 512,
        });

        res.json({ success: true, reply: completion.choices[0].message.content });
    } catch (error) {
        console.error("GROQ AI ERROR:", error);
        res.json({ success: false, reply: "I'm sorry, my systems are currently down." });
    }
}
