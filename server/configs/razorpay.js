import Razorpay from "razorpay";

// Initialize Razorpay instance
// Get test mode keys from Razorpay dashboard: https://dashboard.razorpay.com/app/keys
// Add to .env file:
// RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
// RAZORPAY_KEY_SECRET=your_test_secret_key

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

