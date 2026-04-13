import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

dotenv.config();

const HOTELS = [
  // Himachal Pradesh (6)
  { name: "Taj Theog Resort & Spa", city: "Shimla", address: "Tehsil Theog, Shimla, Himachal Pradesh 171201", contact: "+91 177 283 2323", lat: 31.1197, lng: 77.3484 },
  { name: "Span Resort and Spa", city: "Manali", address: "Kullu Manali Highway, Manali, Himachal Pradesh 175131", contact: "+91 1902 256 041", lat: 32.1883, lng: 77.1643 },
  { name: "Hyatt Regency Dharamshala", city: "Dharamshala", address: "Dharamkot, Dharamshala, Kangra, HP 176219", contact: "+91 1892 245 000", lat: 32.2464, lng: 76.3268 },
  { name: "Norwood Green", city: "Palampur", address: "Bundla Tea Estate, Palampur, Himachal Pradesh 176061", contact: "+91 80910 23111", lat: 32.1109, lng: 76.5363 },
  { name: "Moksha Himalaya Spa Resort", city: "Solan", address: "Parwanoo, Solan, Himachal Pradesh 173220", contact: "+91 1792 233 444", lat: 30.8354, lng: 76.9631 },
  { name: "Aamod at Dalhousie", city: "Dalhousie", address: "Khajjiar Road, Dalhousie, HP 176304", contact: "+91 92892 00000", lat: 32.5369, lng: 76.0123 },

  // Punjab (6)
  { name: "Radisson Blu Hotel", city: "Amritsar", address: "Airport Road, Amritsar, Punjab 143001", contact: "+91 183 661 1111", lat: 31.6961, lng: 74.8080 },
  { name: "Welcomhotel by ITC", city: "Amritsar", address: "Raja Sansi, Amritsar, Punjab 143101", contact: "+91 183 281 4444", lat: 31.6997, lng: 74.7937 },
  { name: "Park Plaza", city: "Ludhiana", address: "Ferozepur Road, Ludhiana, Punjab 141001", contact: "+91 161 437 8000", lat: 30.8927, lng: 75.8144 },
  { name: "Radisson Hotel Jalandhar", city: "Jalandhar", address: "G.T Road, Jalandhar, Punjab 144001", contact: "+91 181 467 1234", lat: 31.3142, lng: 75.5898 },
  { name: "Ramada by Wyndham", city: "Jalandhar", address: "Namdev Chowk, Jalandhar, Punjab 144001", contact: "+91 181 439 0000", lat: 31.3216, lng: 75.5781 },
  { name: "The Kikar Lodge", city: "Rupnagar", address: "Nurpur Bedi, Rupnagar, Punjab 140117", contact: "+91 98101 11111", lat: 31.0664, lng: 76.3533 },

  // Delhi (4)
  { name: "Roseate House", city: "Delhi", address: "Aerocity, New Delhi, 110037", contact: "+91 11 7155 8800", lat: 28.5492, lng: 77.1213 },
  { name: "Andaz Delhi", city: "Delhi", address: "Aerocity, New Delhi, 110037", contact: "+91 11 4903 1234", lat: 28.5526, lng: 77.1226 },
  { name: "The Claridges", city: "Delhi", address: "12 APJ Abdul Kalam Road, New Delhi, 110011", contact: "+91 11 3955 5000", lat: 28.5996, lng: 77.2144 },
  { name: "Shangri-La Eros", city: "Delhi", address: "19 Ashoka Road, Connaught Place, New Delhi 110001", contact: "+91 11 4119 1919", lat: 28.6215, lng: 77.2183 }
];

const ROOM_CONFIGS = [
  { type: "Luxury King Room", priceBase: 9500, amenities: ["Free WiFi", "Breakfast Included", "Heater/AC", "Room Service"] },
  { type: "Executive Suite", priceBase: 16000, amenities: ["Free WiFi", "Pool Access", "Spa Access", "Mini Bar", "City View"] },
  { type: "Presidential Villa", priceBase: 35000, amenities: ["Free WiFi", "Butler Service", "Private Balcony", "Airport Transfer", "Lounge Access"] }
];

// Reusing our 60 highly vetted safe hotel images to shuffle from
const VALID_HOTEL_PHOTOS = [
  "1582719478250-c89cae4dc85b", "1560347876-aeef00ee58a1", "1631049307264-da0ec9d70304", 
  "1578683010236-d716f9a3f461", "1568084680786-a84f91d1153c", "1551882547-ff40c63fe5fa", 
  "1590490360182-c33d57733427", "1519449556851-5720b33024e7", "1596386461350-326ccb383e9f", 
  "1512918728675-ed5a9ecdebfd", "1621293954908-907159247fc8", "1606402179428-a57976d71fa4", 
  "1564501049412-61c2a3083791", "1566073771259-6a8506099945", "1571003123894-1f0594d2b5d9", 
  "1594563703937-fdc640497dcd", "1618773928121-c32242e63f39", "1611892440504-42a792e24d32", 
  "1520250497591-112f2f40a3f4", "1445019980597-93fa8acb246c", "1602343168117-bb8ffe3e2e9f", 
  "1541971875076-8f970d573be6", "1582719508461-905c673771fd", "1631049421450-348ccd7f8949", 
  "1596701062351-8ac031b3c8e2", "1566665797739-1674de7a421a", "1584132967334-10e028bd69f7",
  "1533090161767-e6ffed986c88", "1464822759023-fed622ff2c3b", "1561501878-aabd62634533",
  "1544161515-4ab6ce6db874", "1587381420270-3e1a5b9e6904", "1629140727571-9b5c6f6267b4",
  "1551038247-3d9af20df552", "1540541338287-41700207dee6", "1510414842594-a61c69b5ae57",
  "1615880484746-a134be9a6ecf", "1571896349842-33c89424de2d", "1439130490301-25e322d88054",
  "1501854140801-50d01698950b", "1506059612708-99d6c258160e", "1504700610630-ac6aba3536d3",
  "1554995207-c18c203602cb", "1449158743715-0a90ebb6d2d8", "1586611292717-f828b167408c",
  "1630660664869-c9d3cc676880", "1562790351-d273a961e0e9", "1631049552057-403cdb8f0658",
  "1590490359683-658d3d23f972", "1453396450673-3fe83d2db2c4", "1616594039964-ae9021a400a0",
  "1560200353-ce0a76b1d438", "1459767129954-1b1c1f9b9ace", "1542314831-068cd1dbfeeb",
  "1551918120-9739cb430c6d", "1591088398332-8a7791972843", "1522798514-97ceb8c4f1c8",
  "1610641818989-c2051b5e2cfd", "1549294413-26f195200c16", "1580041065738-e72023775cdc"
];

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function randomVariation(base) {
  const pct = (Math.random() * 0.3) - 0.1;
  return Math.round(base * (1 + pct) / 100) * 100;
}

async function seed() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    console.log("✅ Connected to MongoDB\n");

    const ownerUser = await User.findOne({ _id: "user_36l5F9JQSY6O6MdLOiJh7YYlQd9" }) || await User.findOne({});
    if (!ownerUser) {
        console.error("❌ No users found in DB to assign as hotel owner.");
        process.exit(1);
    }
    const ownerId = ownerUser._id.toString();

    let totalHotels = 0;
    let totalRooms = 0;
    let imageDeck = shuffle([...VALID_HOTEL_PHOTOS]);

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
      const rooms = selectedConfigs.map((cfg) => {
        if (imageDeck.length < 4) {
          imageDeck = shuffle([...VALID_HOTEL_PHOTOS]); // Reshuffle deck when low
        }
        
        const selectedIds = imageDeck.splice(0, 4);
        const images = selectedIds.map(id => `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop`);

        return {
          hotel: hotel._id,
          roomType: cfg.type,
          pricePerNight: randomVariation(cfg.priceBase),
          amenities: cfg.amenities,
          images: images,
          isAvailable: true,
        };
      });

      await Room.insertMany(rooms);

      console.log(`  ✅ [${h.city}] ${h.name} → ${rooms.length} rooms`);
      totalHotels++;
      totalRooms += rooms.length;
    }

    console.log(`\n🎉 Extr Regional Seed Done!`);
    console.log(`   ✅ Created  : ${totalHotels} hotels, ${totalRooms} rooms`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

seed();
