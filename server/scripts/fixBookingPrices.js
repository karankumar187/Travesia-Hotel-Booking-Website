import "dotenv/config";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
console.log("✅ Connected to MongoDB");

const bookings = await Booking.find({ isPaid: false }).populate("room");

let fixed = 0;
for (const booking of bookings) {
  if (!booking.room) continue;

  const nights = Math.ceil(
    (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
  );
  if (nights === 0) continue;

  const correctPrice = booking.room.pricePerNight * nights;

  if (booking.totalPrice !== correctPrice) {
    console.log(`📌 Booking ${booking._id}: ₹${booking.totalPrice} → ₹${correctPrice} (${nights} nights @ ₹${booking.room.pricePerNight})`);
    booking.totalPrice = correctPrice;
    await booking.save();
    fixed++;
  }
}

console.log(`\n✅ Fixed ${fixed} booking(s).`);
mongoose.disconnect();
