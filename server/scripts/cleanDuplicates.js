/**
 * Duplicate Hotel Cleaner
 * Finds hotels with the same name+city, keeps the newest one, deletes the rest + their rooms.
 * Run: npm run clean-duplicates
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

dotenv.config();

async function cleanDuplicates() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    console.log("✅ Connected to MongoDB\n");

    // Find all hotels grouped by name+city
    const allHotels = await Hotel.find().sort({ createdAt: 1 });

    const seen = new Map(); // key: "name||city" → newest hotel doc
    const toDelete = [];

    for (const hotel of allHotels) {
      const key = `${hotel.name.toLowerCase().trim()}||${hotel.city.toLowerCase().trim()}`;
      if (seen.has(key)) {
        // Current one is older (sorted asc), so mark it for deletion, keep seen
        toDelete.push(seen.get(key)); // delete the older one
        seen.set(key, hotel);         // replace with newer
      } else {
        seen.set(key, hotel);
      }
    }

    if (toDelete.length === 0) {
      console.log("✅ No duplicates found. Database is clean!");
      return;
    }

    console.log(`Found ${toDelete.length} duplicate hotel(s) to remove:\n`);

    for (const hotel of toDelete) {
      const deletedRooms = await Room.deleteMany({ hotel: hotel._id });
      await Hotel.findByIdAndDelete(hotel._id);
      console.log(`  🗑️  Deleted: "${hotel.name}" (${hotel.city}) + ${deletedRooms.deletedCount} rooms`);
    }

    console.log(`\n🎉 Cleanup complete! Removed ${toDelete.length} duplicate hotels.`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

cleanDuplicates();
