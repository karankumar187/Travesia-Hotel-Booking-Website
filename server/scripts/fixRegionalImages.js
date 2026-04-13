import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

dotenv.config();

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

// Shuffle array helper
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const REGIONAL_HOTELS = [
  "Wildflower Hall, An Oberoi Resort", "The Himalayan",
  "JW Marriott Hotel", "Taj Chandigarh",
  "Taj Swarna", "Hyatt Regency",
  "The Lodhi", "Le Méridien",
  "Trident Bandra Kurla", "The St. Regis",
  "Taj Lakefront", "Sayaji Hotel",
  "Khyber Himalayan Resort & Spa", "Taj Vivanta Dal View"
];

async function updateRegionalImages() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    console.log("✅ Connected to MongoDB\n");

    let updatedRooms = 0;
    
    // Create a shuffled deck of our 60 unique images
    let imageDeck = shuffle([...VALID_HOTEL_PHOTOS]);

    for (const hName of REGIONAL_HOTELS) {
      const hotel = await Hotel.findOne({ name: hName });
      if (!hotel) continue;

      const rooms = await Room.find({ hotel: hotel._id });
      for (const room of rooms) {
        // Pop 4 fresh images from the deck for this room
        // If we're out of cards, create a new deck
        if (imageDeck.length < 4) {
          imageDeck = shuffle([...VALID_HOTEL_PHOTOS]);
        }
        
        const selectedIds = imageDeck.splice(0, 4);
        room.images = selectedIds.map(id => `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop`);
        await room.save();
        updatedRooms++;
      }
      console.log(`✅ Reprogrammed dynamic image URLs for: ${hName}`);
    }

    console.log(`\n🎉 Success! Overwrote ${updatedRooms} rooms with distinct, validated 4-image arrays.`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

updateRegionalImages();
