import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error("❌ Razorpay keys not found in environment variables!");
  console.error("Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file");
  console.error("Get your keys from: https://dashboard.razorpay.com/app/keys");
}

let razorpay = null;

try {
  if (keyId && keySecret) {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log("✅ Razorpay initialized successfully");
  } else {
    console.error("❌ Razorpay not initialized - missing API keys");
  }
} catch (error) {
  console.error("❌ Failed to initialize Razorpay:", error.message);
}

export default razorpay;

