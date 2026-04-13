/**
 * Hotel Seeder — Curated Real Indian Hotels Dataset
 * Uses real hotel names, addresses, and GPS coordinates.
 *
 * Usage: npm run seed-hotels
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

dotenv.config();

// ─── Curated Hotel Data ───────────────────────────────────────────────────────
const HOTELS = [
  // Delhi
  { name: "The Imperial New Delhi", city: "Delhi", address: "Janpath, New Delhi, 110001", contact: "+91 11 2334 1234", lat: 28.6236, lng: 77.2194 },
  { name: "The Leela Palace New Delhi", city: "Delhi", address: "Diplomatic Enclave, Chanakyapuri, New Delhi", contact: "+91 11 3933 1234", lat: 28.5936, lng: 77.1862 },
  { name: "ITC Maurya New Delhi", city: "Delhi", address: "Sardar Patel Marg, Diplomatic Enclave, New Delhi", contact: "+91 11 2611 2233", lat: 28.5976, lng: 77.1826 },
  { name: "Taj Mahal Hotel New Delhi", city: "Delhi", address: "1 Man Singh Road, New Delhi, 110011", contact: "+91 11 6651 3000", lat: 28.6136, lng: 77.2230 },
  { name: "The Oberoi New Delhi", city: "Delhi", address: "Dr. Zakir Hussain Marg, New Delhi, 110003", contact: "+91 11 2436 3030", lat: 28.5960, lng: 77.2286 },

  // Mumbai
  { name: "The Taj Mahal Palace Mumbai", city: "Mumbai", address: "Apollo Bunder, Colaba, Mumbai, 400001", contact: "+91 22 6665 3366", lat: 18.9220, lng: 72.8330 },
  { name: "The Oberoi Mumbai", city: "Mumbai", address: "Nariman Point, Mumbai, 400021", contact: "+91 22 6632 5757", lat: 18.9255, lng: 72.8242 },
  { name: "Four Seasons Hotel Mumbai", city: "Mumbai", address: "114 Dr. E Moses Road, Worli, Mumbai", contact: "+91 22 2481 8000", lat: 19.0112, lng: 72.8181 },
  { name: "JW Marriott Mumbai Juhu", city: "Mumbai", address: "Juhu Tara Road, Juhu, Mumbai, 400049", contact: "+91 22 6693 3000", lat: 19.0990, lng: 72.8270 },
  { name: "Hotel Sea Princess Mumbai", city: "Mumbai", address: "Juhu Beach, Mumbai, 400049", contact: "+91 22 6698 9898", lat: 19.0960, lng: 72.8255 },

  // Bangalore
  { name: "The Leela Palace Bengaluru", city: "Bangalore", address: "23 Airport Road, Bengaluru, 560008", contact: "+91 80 2521 1234", lat: 12.9854, lng: 77.6519 },
  { name: "ITC Gardenia Bengaluru", city: "Bangalore", address: "1 Residency Road, Bengaluru, 560025", contact: "+91 80 2211 9898", lat: 12.9715, lng: 77.5975 },
  { name: "Taj MG Road Bengaluru", city: "Bangalore", address: "41/3 Mahatma Gandhi Road, Bengaluru", contact: "+91 80 6660 4444", lat: 12.9744, lng: 77.6085 },
  { name: "The Oberoi Bengaluru", city: "Bangalore", address: "37-39 Mahatma Gandhi Road, Bengaluru", contact: "+91 80 2558 5858", lat: 12.9752, lng: 77.6096 },

  // Jaipur
  { name: "Rambagh Palace Jaipur", city: "Jaipur", address: "Bhawani Singh Road, Jaipur, 302005", contact: "+91 141 2211 919", lat: 26.8862, lng: 75.8170 },
  { name: "The Oberoi Rajvilas", city: "Jaipur", address: "Goner Road, Jaipur, 303012", contact: "+91 141 2680 101", lat: 26.9006, lng: 75.8767 },
  { name: "Taj Jai Mahal Palace Jaipur", city: "Jaipur", address: "Jacob Road, Civil Lines, Jaipur", contact: "+91 141 2223 636", lat: 26.9164, lng: 75.7990 },
  { name: "Samode Haveli Jaipur", city: "Jaipur", address: "Gangapole, Jaipur, Rajasthan 302002", contact: "+91 141 2632 407", lat: 26.9290, lng: 75.8310 },

  // Goa
  { name: "Taj Exotica Resort & Spa Goa", city: "Goa", address: "Calwaddo, Benaulim, South Goa, 403716", contact: "+91 832 668 3333", lat: 15.2562, lng: 73.9360 },
  { name: "The Leela Goa", city: "Goa", address: "Mobor, Cavelossim, South Goa, 403731", contact: "+91 832 287 1234", lat: 15.1600, lng: 73.9474 },
  { name: "Park Hyatt Goa Resort & Spa", city: "Goa", address: "Arossim Beach, Cansaulim, South Goa", contact: "+91 832 272 1234", lat: 15.2174, lng: 73.9414 },
  { name: "Grand Hyatt Goa", city: "Goa", address: "Bambolim Bay Resort, North Goa, 403206", contact: "+91 832 301 1234", lat: 15.4548, lng: 73.8391 },

  // Agra
  { name: "The Oberoi Amarvilas Agra", city: "Agra", address: "Taj East Gate Road, Agra, 282001", contact: "+91 562 223 1515", lat: 27.1699, lng: 78.0445 },
  { name: "ITC Mughal Agra", city: "Agra", address: "Taj Ganj, Agra, Uttar Pradesh 282001", contact: "+91 562 402 1700", lat: 27.1680, lng: 78.0415 },
  { name: "Taj Hotel & Convention Centre Agra", city: "Agra", address: "Fatehabad Road, Agra, 282001", contact: "+91 562 660 2020", lat: 27.1587, lng: 77.9960 },

  // Kolkata
  { name: "The Oberoi Grand Kolkata", city: "Kolkata", address: "15 Jawaharlal Nehru Road, Kolkata, 700013", contact: "+91 33 2249 2323", lat: 22.5535, lng: 88.3492 },
  { name: "ITC Royal Bengal Kolkata", city: "Kolkata", address: "1 JBS Haldane Avenue, Kolkata, 700105", contact: "+91 33 4455 0000", lat: 22.5208, lng: 88.3768 },
  { name: "Taj Bengal Kolkata", city: "Kolkata", address: "34B Belvedere Road, Alipore, Kolkata", contact: "+91 33 6612 3939", lat: 22.5351, lng: 88.3301 },

  // Chennai
  { name: "ITC Grand Chola Chennai", city: "Chennai", address: "63 Mount Road, Guindy, Chennai, 600032", contact: "+91 44 2220 0000", lat: 13.0074, lng: 80.2178 },
  { name: "The Leela Palace Chennai", city: "Chennai", address: "Adyar Seaface, MRC Nagar, Chennai", contact: "+91 44 3366 1234", lat: 13.0063, lng: 80.2635 },
  { name: "Taj Coromandel Chennai", city: "Chennai", address: "37 Mahatma Gandhi Road, Nungambakkam, Chennai", contact: "+91 44 6600 2827", lat: 13.0630, lng: 80.2445 },

  // Udaipur (bonus)
  { name: "Taj Lake Palace Udaipur", city: "Udaipur", address: "Lake Pichola, Udaipur, Rajasthan 313001", contact: "+91 294 242 8800", lat: 24.5754, lng: 73.6831 },
  { name: "The Oberoi Udaivilas", city: "Udaipur", address: "Haridasji Ki Magri, Udaipur, Rajasthan", contact: "+91 294 243 3300", lat: 24.5737, lng: 73.6765 },
  { name: "Leela Palace Udaipur", city: "Udaipur", address: "Lake Pichola, Udaipur, Rajasthan 313001", contact: "+91 294 670 1234", lat: 24.5744, lng: 73.6847 },
];

// ─── Room Config ──────────────────────────────────────────────────────────────
const ROOM_CONFIGS = [
  { type: "Single Bed",   priceBase: 3500,  amenities: ["Free WiFi", "Room Service"] },
  { type: "Double Bed",   priceBase: 6000,  amenities: ["Free WiFi", "Free Breakfast", "Room Service"] },
  { type: "Luxury Room",  priceBase: 12000, amenities: ["Free WiFi", "Free Breakfast", "Room Service", "Pool Access"] },
  { type: "Family Suite", priceBase: 18000, amenities: ["Free WiFi", "Free Breakfast", "Room Service", "Pool Access", "Mountain View"] },
];

const ROOM_IMAGES = [
  ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"],
  ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800"],
  ["https://images.unsplash.com/photo-1596701062351-8ac031b3c8e2?w=800", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"],
  ["https://images.unsplash.com/photo-1638689428699-b1e9a85d0c36?w=800", "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"],
];

function randomVariation(base) {
  const pct = (Math.random() * 0.3) - 0.1; // ±10-30% variation
  return Math.round(base * (1 + pct) / 100) * 100;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    console.log("✅ Connected to MongoDB\n");

    // Find owner
    let ownerId = process.env.SEED_OWNER_ID;
    if (!ownerId) {
      const ownerUser = await User.findOne({ role: "hotelOwner" });
      if (!ownerUser) {
        console.error("❌ No hotel owner found in DB. Please register a hotel first via the app,");
        console.error("   then run this script. (Or set SEED_OWNER_ID=<clerk_user_id> in .env)");
        process.exit(1);
      }
      ownerId = ownerUser._id.toString();
      console.log(`ℹ️  Owner: ${ownerUser.username || ownerUser.email} (${ownerId})\n`);
    }

    let totalHotels = 0;
    let totalRooms  = 0;
    let skipped     = 0;

    for (const h of HOTELS) {
      const exists = await Hotel.findOne({ name: h.name, city: h.city });
      if (exists) {
        console.log(`  ⏭️  Skipping (exists): ${h.name}`);
        skipped++;
        continue;
      }

      const hotel = await Hotel.create({
        name:     h.name,
        address:  h.address,
        contact:  h.contact,
        city:     h.city,
        owner:    ownerId,
        location: { lat: h.lat, lng: h.lng },
      });

      // Create 2 random room types per hotel
      const selectedConfigs = ROOM_CONFIGS.sort(() => Math.random() - 0.5).slice(0, 2);
      const rooms = selectedConfigs.map((cfg, i) => ({
        hotel:        hotel._id,
        roomType:     cfg.type,
        pricePerNight: randomVariation(cfg.priceBase),
        amenities:    cfg.amenities,
        images:       ROOM_IMAGES[i % ROOM_IMAGES.length],
        isAvailable:  true,
      }));

      await Room.insertMany(rooms);

      console.log(`  ✅ [${h.city}] ${h.name} → ${rooms.length} rooms`);
      totalHotels++;
      totalRooms += rooms.length;
    }

    console.log(`\n🎉 Done!`);
    console.log(`   ✅ Created  : ${totalHotels} hotels, ${totalRooms} rooms`);
    console.log(`   ⏭️  Skipped  : ${skipped} (already in DB)`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

seed();
