/**
 * Hotel Image Updater — Patches all seeded rooms with unique per-hotel images.
 * Run: npm run update-images
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

dotenv.config();

// Unique Unsplash images per hotel (2 photos each, hotel-accurate aesthetics)
const HOTEL_IMAGES = {
  // ── Delhi ──────────────────────────────────────────────────────────────────
  "The Imperial New Delhi": [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&auto=format&fit=crop",
  ],
  "The Leela Palace New Delhi": [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop",
  ],
  "ITC Maurya New Delhi": [
    "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop",
  ],
  "Taj Mahal Hotel New Delhi": [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&auto=format&fit=crop",
  ],
  "The Oberoi New Delhi": [
    "https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop",
  ],

  // ── Mumbai ─────────────────────────────────────────────────────────────────
  "The Taj Mahal Palace Mumbai": [
    "https://images.unsplash.com/photo-1621293954908-907159247fc8?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=800&auto=format&fit=crop",
  ],
  "The Oberoi Mumbai": [
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
  ],
  "Four Seasons Hotel Mumbai": [
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?w=800&auto=format&fit=crop",
  ],
  "JW Marriott Mumbai Juhu": [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop",
  ],
  "Hotel Sea Princess Mumbai": [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop",
  ],

  // ── Bangalore ──────────────────────────────────────────────────────────────
  "The Leela Palace Bengaluru": [
    "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541971875076-8f970d573be6?w=800&auto=format&fit=crop",
  ],
  "ITC Gardenia Bengaluru": [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&auto=format&fit=crop",
  ],
  "Taj MG Road Bengaluru": [
    "https://images.unsplash.com/photo-1596701062351-8ac031b3c8e2?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop",
  ],
  "The Oberoi Bengaluru": [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop",
  ],

  // ── Jaipur ─────────────────────────────────────────────────────────────────
  "Rambagh Palace Jaipur": [
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
  ],
  "The Oberoi Rajvilas": [
    "https://images.unsplash.com/photo-1561501878-aabd62634533?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop",
  ],
  "Taj Jai Mahal Palace Jaipur": [
    "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800&auto=format&fit=crop",
  ],
  "Samode Haveli Jaipur": [
    "https://images.unsplash.com/photo-1551038247-3d9af20df552?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop",
  ],

  // ── Goa ────────────────────────────────────────────────────────────────────
  "Taj Exotica Resort & Spa Goa": [
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&auto=format&fit=crop",
  ],
  "The Leela Goa": [
    "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
  ],
  "Park Hyatt Goa Resort & Spa": [
    "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop",
  ],
  "Grand Hyatt Goa": [
    "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=800&auto=format&fit=crop",
  ],

  // ── Agra ───────────────────────────────────────────────────────────────────
  "The Oberoi Amarvilas Agra": [
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&auto=format&fit=crop",
  ],
  "ITC Mughal Agra": [
    "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1630660664869-c9d3cc676880?w=800&auto=format&fit=crop",
  ],
  "Taj Hotel & Convention Centre Agra": [
    "https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&auto=format&fit=crop",
  ],

  // ── Kolkata ────────────────────────────────────────────────────────────────
  "The Oberoi Grand Kolkata": [
    "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?w=800&auto=format&fit=crop",
  ],
  "ITC Royal Bengal Kolkata": [
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560200353-ce0a76b1d438?w=800&auto=format&fit=crop",
  ],
  "Taj Bengal Kolkata": [
    "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&auto=format&fit=crop",
  ],

  // ── Chennai ────────────────────────────────────────────────────────────────
  "ITC Grand Chola Chennai": [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&auto=format&fit=crop",
  ],
  "The Leela Palace Chennai": [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop",
  ],
  "Taj Coromandel Chennai": [
    "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=800&auto=format&fit=crop",
  ],

  // ── Udaipur ────────────────────────────────────────────────────────────────
  "Taj Lake Palace Udaipur": [
    "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
  ],
  "The Oberoi Udaivilas": [
    "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop",
  ],
  "Leela Palace Udaipur": [
    "https://images.unsplash.com/photo-1580041065738-e72023775cdc?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop",
  ],
};

async function updateImages() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    console.log("✅ Connected to MongoDB\n");

    let updated = 0;
    let notFound = 0;

    for (const [hotelName, images] of Object.entries(HOTEL_IMAGES)) {
      const hotel = await Hotel.findOne({ name: hotelName });
      if (!hotel) {
        console.log(`  ⚠️  Hotel not found: ${hotelName}`);
        notFound++;
        continue;
      }

      const rooms = await Room.find({ hotel: hotel._id });
      for (const room of rooms) {
        room.images = images;
        await room.save();
        updated++;
      }

      console.log(`  ✅ Updated ${rooms.length} rooms for: ${hotelName}`);
    }

    console.log(`\n🎉 Done!`);
    console.log(`   Updated : ${updated} rooms`);
    console.log(`   Skipped : ${notFound} hotels not found`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

updateImages();
