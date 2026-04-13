/**
 * Supplemental Hotel Seeder
 * Regions: Himachal Pradesh, Chandigarh, Punjab, Delhi, Mumbai, Madhya Pradesh, JK
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

dotenv.config();

const HOTELS = [
  // Himachal Pradesh
  { name: "Wildflower Hall, An Oberoi Resort", city: "Shimla", address: "Chharabra, Shimla, Himachal Pradesh 171012", contact: "+91 177 264 8585", lat: 31.1048, lng: 77.2024 },
  { name: "The Himalayan", city: "Manali", address: "Hadimba Road, Manali, Himachal Pradesh 175131", contact: "+91 1902 250 999", lat: 32.2472, lng: 77.1855 },
  
  // Chandigarh
  { name: "JW Marriott Hotel", city: "Chandigarh", address: "Plot No: 6, Sector 35-B, Dakshin Marg, Chandigarh 160035", contact: "+91 172 455 5555", lat: 30.7285, lng: 76.7644 },
  { name: "Taj Chandigarh", city: "Chandigarh", address: "Block No. 9, Sector 17-A, Chandigarh 160017", contact: "+91 172 661 3000", lat: 30.7410, lng: 76.7820 },
  
  // Punjab
  { name: "Taj Swarna", city: "Amritsar", address: "Plot No. C-3, Outer Circular Road, Amritsar, Punjab 143001", contact: "+91 183 665 8000", lat: 31.6429, lng: 74.8780 },
  { name: "Hyatt Regency", city: "Ludhiana", address: "Site No. 4, Ferozepur Road, Ludhiana, Punjab 141001", contact: "+91 161 402 1234", lat: 30.8931, lng: 75.8130 },
  
  // Delhi
  { name: "The Lodhi", city: "Delhi", address: "Lodhi Road, New Delhi, 110003", contact: "+91 11 4363 3333", lat: 28.5911, lng: 77.2374 },
  { name: "Le Méridien", city: "Delhi", address: "Windsor Place, New Delhi, 110001", contact: "+91 11 2371 0101", lat: 28.6200, lng: 77.2185 },
  
  // Mumbai
  { name: "Trident Bandra Kurla", city: "Mumbai", address: "C-56, G Block, Bandra Kurla Complex, Mumbai, 400098", contact: "+91 22 6672 6672", lat: 19.0652, lng: 72.8647 },
  { name: "The St. Regis", city: "Mumbai", address: "462, Senapati Bapat Marg, Lower Parel, Mumbai, 400013", contact: "+91 22 6162 8000", lat: 18.9950, lng: 72.8252 },
  
  // Madhya Pradesh
  { name: "Taj Lakefront", city: "Bhopal", address: "Prempura, Bhadbhada Road, Bhopal, MP 462003", contact: "+91 755 437 0000", lat: 23.2323, lng: 77.3687 },
  { name: "Sayaji Hotel", city: "Indore", address: "H-1, Scheme No.54, Vijay Nagar, Indore, MP 452010", contact: "+91 731 400 6666", lat: 22.7533, lng: 75.8937 },
  
  // JK
  { name: "Khyber Himalayan Resort & Spa", city: "Gulmarg", address: "Gulmarg, Jammu and Kashmir 193203", contact: "+91 1954 254 666", lat: 34.0484, lng: 74.3805 },
  { name: "Taj Vivanta Dal View", city: "Srinagar", address: "Kralsangri, Brein, Srinagar, J&K 191121", contact: "+91 194 246 1111", lat: 34.0837, lng: 74.8340 }
];

const ROOM_CONFIGS = [
  { type: "Deluxe Heritage", priceBase: 8500, amenities: ["Free WiFi", "Breakfast Included", "Heater/AC", "Mountain View"] },
  { type: "Premium Grand", priceBase: 14000, amenities: ["Free WiFi", "Pool Access", "Spa Access", "Mini Bar", "City View"] },
  { type: "Royal Suite", priceBase: 25000, amenities: ["Free WiFi", "Butler Service", "Private Balcony", "Airport Transfer", "Lounge Access"] }
];

// Unique un-used images
const ROOM_IMAGES = [
  [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    "https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
  ],
  [
    "https://images.unsplash.com/photo-1512626262374-124b89694680?w=800",
    "https://images.unsplash.com/photo-1551882547-ff40c0d1398c?w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a308375d?w=800"
  ],
  [
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    "https://images.unsplash.com/photo-1572569269550-96f04c664531?w=800",
    "https://images.unsplash.com/photo-1528904250062-add60c915f01?w=800",
    "https://images.unsplash.com/photo-1598928506311-c55dd38a6889?w=800"
  ],
  [
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
    "https://images.unsplash.com/photo-1497362943212-0b2612711152?w=800",
    "https://images.unsplash.com/photo-1571508601891-ca5a771bb702?w=800",
    "https://images.unsplash.com/photo-1542314831-c6a4d14d8c53?w=800"
  ]
];

function randomVariation(base) {
  const pct = (Math.random() * 0.3) - 0.1;
  return Math.round(base * (1 + pct) / 100) * 100;
}

async function seed() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    console.log("✅ Connected to MongoDB\\n");

    const ownerUser = await User.findOne({ _id: "user_36l5F9JQSY6O6MdLOiJh7YYlQd9" }) || await User.findOne({});
    if (!ownerUser) {
      console.error("❌ No users found in DB to assign as hotel owner.");
      process.exit(1);
    }
    const ownerId = ownerUser._id.toString();
    console.log(`ℹ️ Assigning hotels to Owner: ${ownerId}\\n`);

    let totalHotels = 0;
    let totalRooms = 0;

    for (const h of HOTELS) {
      const exists = await Hotel.findOne({ name: h.name, city: h.city });
      if (exists) {
        console.log(`  ⏭️ Skipping (already exists): ${h.name}`);
        continue;
      }

      const hotel = await Hotel.create({
        name: h.name,
        address: h.address,
        contact: h.contact,
        city: h.city,
        owner: ownerId,
        location: { lat: h.lat, lng: h.lng },
      });

      // Create 2 room types per hotel
      const selectedConfigs = ROOM_CONFIGS.sort(() => Math.random() - 0.5).slice(0, 2);
      const rooms = selectedConfigs.map((cfg, i) => {
        // give each room type a consistent distinct image array
        // mix it with hotel index to rotate combinations
        const imageSetIndex = (totalHotels + i) % ROOM_IMAGES.length;
        return {
          hotel: hotel._id,
          roomType: cfg.type,
          pricePerNight: randomVariation(cfg.priceBase),
          amenities: cfg.amenities,
          images: ROOM_IMAGES[imageSetIndex],
          isAvailable: true,
        };
      });

      await Room.insertMany(rooms);

      console.log(`  ✅ [${h.city}] ${h.name} → ${rooms.length} rooms`);
      totalHotels++;
      totalRooms += rooms.length;
    }

    console.log(`\\n🎉 Regional Seed Done!`);
    console.log(`   ✅ Created  : ${totalHotels} hotels, ${totalRooms} rooms`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

seed();
