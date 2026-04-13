/**
 * DB Inspector — Lists all hotels with room counts
 * Run: npm run inspect-db
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
dotenv.config();

async function inspect() {
  await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
  console.log("✅ Connected\n");

  const hotels = await Hotel.find().sort({ city: 1, name: 1 });
  const roomCounts = await Room.aggregate([
    { $group: { _id: "$hotel", count: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(roomCounts.map(r => [r._id.toString(), r.count]));

  console.log(`Total hotels in DB: ${hotels.length}\n`);
  let lastCity = "";
  for (const h of hotels) {
    if (h.city !== lastCity) { console.log(`\n── ${h.city} ──`); lastCity = h.city; }
    console.log(`  [${h._id}]  ${h.name}  (${countMap[h._id.toString()] || 0} rooms)`);
  }

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected.");
}

inspect().catch(console.error);
