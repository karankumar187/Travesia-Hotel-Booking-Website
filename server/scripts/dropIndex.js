import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config(); // Reads from CWD, which is server/

async function clearOldIndexes() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
        console.log("Connected successfully.");

        const hotelCollection = mongoose.connection.collection("hotels");
        const indexes = await hotelCollection.indexes();
        console.log("Current indexes on 'hotels' collection:");
        console.log(JSON.stringify(indexes, null, 2));

        const ownerIndex = indexes.find(idx => idx.name === "owner_1" || (idx.key && idx.key.owner === 1));
        if (ownerIndex && ownerIndex.unique) {
            console.log(`Found unique index '${ownerIndex.name}', dropping...`);
            await hotelCollection.dropIndex(ownerIndex.name);
            console.log("Index dropped. Multiple hotels can now be created by the same owner.");
        } else {
            console.log("No unique index on 'owner' was found.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

clearOldIndexes();
