import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import razorpay from "../configs/razorpay.js";
import crypto from "crypto";
import { fetchUserFromClerk } from "../utils/clerkHelper.js";
//function to check availability of room

const checkAvailability=async({checkInDate,checkOutDate,room})=>{
    try{
        const bookings=await Booking.find({
            room,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        })
        const isAvailable=bookings.length===0;
        return isAvailable;
    }catch(error){
        console.error("CHECK AVAILABILITY ERROR:", error.message);
        return false; // Return false on error to be safe
    }
}

//api to check availability of rooms
//post/api/booking/check-availability
export const checkAvailabilityAPI=async(req,res)=>{
    try{
        const{room,checkInDate,checkOutDate}=req.body;
        const isAvailable=await checkAvailability({checkInDate,checkOutDate,room});
        res.json({success: true, isAvailable})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

//API to create a new booking
//post/api/bookings/book
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;

    const auth = await req.auth();
    const user = auth.userId; // ✅ Clerk user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    // check availability
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room is not available",
      });
    }

    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData) {
      return res.json({
        success: false,
        message: "Room not found",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = roomData.pricePerNight * nights;

    const booking = await Booking.create({
      user, 
      room,
      hotel: roomData.hotel._id,
      guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    // Get user data for email
    let userData = await User.findById(user);

    // If user not found in database, try to fetch from Clerk API and create in database
    if (!userData) {
      console.log("⚠️ User not found in database, attempting to fetch from Clerk API...");
      try {
        const clerkUserData = await fetchUserFromClerk(user);
        
        if (clerkUserData && clerkUserData.email) {
          // Create user in database
          userData = await User.create(clerkUserData);
          console.log(`✅ User created in database from Clerk API: ${clerkUserData.email}`);
        } else {
          console.warn("⚠️ Could not fetch user from Clerk API or user has no email");
          if (clerkUserData && !clerkUserData.email) {
            console.warn("   User exists in Clerk but has no email address");
          }
        }
      } catch (clerkError) {
        console.error("❌ Error fetching user from Clerk API:", clerkError.message);
      }
    }

    console.log("\n📧 EMAIL SENDING PROCESS:");
    console.log("User Data:", userData ? { email: userData.email, username: userData.username } : "User not found");
    console.log("SMTP Config Check:", {
      hasSMTP_USER: !!process.env.SMTP_USER,
      hasSMTP_PASS: !!process.env.SMTP_PASS,
      hasSENDER_EMAIL: !!process.env.SENDER_EMAIL,
      SMTP_PROVIDER: process.env.SMTP_PROVIDER || 'auto-detect'
    });

    // Send booking confirmation email (non-blocking - don't fail booking if email fails)
    if (userData && userData.email) {
      try {
        // Check if transporter is available
        if (!transporter) {
          console.error("❌ Email transporter not available - SMTP not configured");
          console.error("   Please configure SMTP_USER and SMTP_PASS in your .env file");
          console.error("   Emails will not be sent until SMTP is properly configured");
        } else {
          const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;
          
          if (!senderEmail) {
            console.error("❌ SENDER_EMAIL or SMTP_USER not configured in .env file");
            console.error("   Please add SMTP_USER=your-email@gmail.com to your .env file");
          } else if (!process.env.SMTP_PASS) {
            console.error("❌ SMTP_PASS not configured in .env file");
            console.error("   Please add SMTP_PASS=your-app-password to your .env file");
          } else {
            console.log(`📤 Attempting to send booking confirmation email from: ${senderEmail} to: ${userData.email}`);
          
          const mailOptions = {
            from: senderEmail,
            to: userData.email,
            subject: "Booking Confirmation - Payment Pending",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3399cc;">Booking Received! 📧</h2>
              <p>Dear ${userData.username || 'Guest'},</p>
              <p>Thank you for your booking! Your reservation has been created successfully.</p>
              <p><strong>Note:</strong> Please complete the payment to confirm your booking.</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Details</h3>
                <p><strong>Booking ID:</strong> ${booking._id}</p>
                <p><strong>Hotel Name:</strong> ${roomData.hotel.name}</p>
                <p><strong>Location:</strong> ${roomData.hotel.address}</p>
                <p><strong>Check-in Date:</strong> ${new Date(checkInDate).toLocaleDateString()}</p>
                <p><strong>Check-out Date:</strong> ${new Date(checkOutDate).toLocaleDateString()}</p>
                <p><strong>Number of Nights:</strong> ${nights}</p>
                <p><strong>Guests:</strong> ${guests}</p>
                <p><strong>Total Amount:</strong> ${process.env.CURRENCY || '₹'} ${totalPrice}</p>
                <p><strong>Payment Status:</strong> <span style="color: orange;">Pending</span></p>
              </div>
              
              <p>Please complete your payment to confirm this booking. You can pay from your bookings page.</p>
              <p>We look forward to welcoming you!</p>
              
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
            </div>
            `
          };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Booking confirmation email sent successfully to ${userData.email}`);
            console.log("Email Response:", {
              messageId: info.messageId,
              accepted: info.accepted,
              rejected: info.rejected,
              response: info.response
            });
          }
        }
      } catch (emailError) {
        // Log detailed error but don't fail the booking
        console.error("❌ Failed to send booking confirmation email");
        console.error("Error Details:", {
          message: emailError.message,
          code: emailError.code,
          command: emailError.command,
          response: emailError.response,
          responseCode: emailError.responseCode
        });
        
        // Gmail-specific error messages
        if (emailError.code === 'EAUTH') {
          console.error("\n🔐 Authentication Error:");
          console.error("For Gmail: Make sure you're using an App Password, not your regular password");
          console.error("Generate App Password: https://myaccount.google.com/apppasswords");
          console.error("Steps:");
          console.error("1. Go to your Google Account settings");
          console.error("2. Enable 2-Step Verification");
          console.error("3. Generate an App Password for 'Mail'");
          console.error("4. Use that 16-character password as SMTP_PASS in .env");
        } else if (emailError.code === 'EENVELOPE') {
          console.error("\n📧 Envelope Error: Check if sender email is correct");
          console.error("Make sure SENDER_EMAIL matches your SMTP_USER");
        } else if (emailError.code === 'ECONNECTION' || emailError.code === 'ETIMEDOUT') {
          console.error("\n🌐 Connection Error: Check your internet connection");
        } else {
          console.error("\n💡 Troubleshooting:");
          console.error("1. Check if SMTP_USER and SMTP_PASS are set in .env");
          console.error("2. For Gmail, use App Password (not regular password)");
          console.error("3. Make sure SENDER_EMAIL is set (or it will use SMTP_USER)");
          console.error("4. Restart your server after updating .env file");
        }
      }
    } else {
      console.warn("⚠️ User email not found - skipping email notification");
      if (userData) {
        console.warn("   User exists but email is missing. User data:", {
          id: userData._id,
          username: userData.username,
          hasEmail: !!userData.email
        });
      } else {
        console.warn("   User not found in database for userId:", user);
        console.warn("   This might happen if the user was created before webhook was set up");
      }
    }

    res.json({
      success: true,
      message: "Booking created successfully",
    });

  } catch (error) {
    console.error("BOOKING ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};


//API to get all booking for a user
//get/api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const auth = await req.auth();
    const user = auth.userId; // ✅ Clerk user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("GET USER BOOKINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};


export const getHotelBookings = async (req, res) => {
  try {
    const auth = await req.auth();
    const hotel = await Hotel.findOne({ owner: auth.userId });

    if (!hotel) {
      return res.json({
        success: false,
        message: "No hotel found"
      });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    // total bookings
    const totalBookings = bookings.length;

    // total revenue
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: {
        bookings, // Include bookings array for the table
        totalBookings,
        totalRevenue
      }
    });

  } catch (error) {
    console.error("GET HOTEL BOOKINGS ERROR:", error);
    res.json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

//API to create Razorpay order for a booking
//POST /api/bookings/payment/:bookingId
export const processPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const auth = await req.auth();
    const user = auth.userId;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("room hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify that the booking belongs to the user
    if (booking.user !== user) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to pay for this booking"
      });
    }

    // Check if already paid
    if (booking.isPaid) {
      return res.json({
        success: false,
        message: "This booking has already been paid"
      });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured. Please contact administrator.",
        error: "Razorpay not initialized - missing API keys"
      });
    }

    // Validate amount
    if (!booking.totalPrice || booking.totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount"
      });
    }

    // Get user data for payment
    const userData = await User.findById(user);

    // Create Razorpay order
    const amountInPaise = Math.round(booking.totalPrice * 100); // Amount in paise (multiply by 100)
    
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum payment amount is ₹1.00"
      });
    }

    // Generate receipt ID (max 40 characters for Razorpay)
    // Format: BKG + last 12 chars of bookingId + timestamp (last 8 digits)
    const bookingIdStr = bookingId.toString();
    const shortBookingId = bookingIdStr.length > 12 ? bookingIdStr.slice(-12) : bookingIdStr;
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `BKG${shortBookingId}${timestamp}`.slice(0, 40); // Ensure max 40 chars

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        bookingId: bookingId.toString(),
        hotelName: booking.hotel?.name || "Hotel",
        roomType: booking.room?.roomType || "Room",
        checkIn: booking.checkInDate?.toISOString() || new Date().toISOString(),
        checkOut: booking.checkOutDate?.toISOString() || new Date().toISOString(),
      },
    };

    console.log("Creating Razorpay order with options:", {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    });

    const order = await razorpay.orders.create(options);

    console.log("Razorpay order created successfully:", order.id);

    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error. Please contact administrator.",
        error: "RAZORPAY_KEY_ID not found in environment variables"
      });
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: bookingId,
      customerName: userData?.username || "Guest",
      customerEmail: userData?.email || "",
    });

  } catch (error) {
    console.error("RAZORPAY ORDER CREATION ERROR:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to create payment order";
    
    if (error.error) {
      // Razorpay API error
      if (error.error.description) {
        errorMessage = error.error.description;
      } else if (error.error.reason) {
        errorMessage = error.error.reason;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Check for common errors
    if (error.statusCode === 401) {
      errorMessage = "Invalid Razorpay API keys. Please check your configuration.";
    } else if (error.statusCode === 400) {
      errorMessage = error.error?.description || "Invalid payment request";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.error || error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

//API to verify Razorpay payment
//POST /api/bookings/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;
    const auth = await req.auth();
    const user = auth.userId;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify that the booking belongs to the user
    if (booking.user !== user) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to verify this payment"
      });
    }

    // Verify payment signature
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature"
      });
    }

    // Payment verified successfully
    booking.isPaid = true;
    booking.paymentMethod = "razorpay";
    booking.status = "confirmed";
    // Store payment details if you have a paymentDetails field in your schema
    await booking.save();

    // Get booking details with populated fields for email
    const bookingDetails = await Booking.findById(bookingId)
      .populate("room hotel");

    // Get user data for email
    let userData = await User.findById(user);

    // If user not found in database, try to fetch from Clerk API and create in database
    if (!userData) {
      console.log("⚠️ User not found in database for payment email, attempting to fetch from Clerk API...");
      try {
        const clerkUserData = await fetchUserFromClerk(user);
        
        if (clerkUserData && clerkUserData.email) {
          // Create user in database
          userData = await User.create(clerkUserData);
          console.log(`✅ User created in database from Clerk API: ${clerkUserData.email}`);
        } else {
          console.warn("⚠️ Could not fetch user from Clerk API or user has no email");
          if (clerkUserData && !clerkUserData.email) {
            console.warn("   User exists in Clerk but has no email address");
          }
        }
      } catch (clerkError) {
        console.error("❌ Error fetching user from Clerk API:", clerkError.message);
      }
    }

    // Send payment confirmation email
    if (userData && userData.email && bookingDetails) {
      try {
        // Check if transporter is available
        if (!transporter) {
          console.error("❌ Email transporter not available - SMTP not configured");
          console.error("   Please configure SMTP_USER and SMTP_PASS in your .env file");
        } else {
          const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;
          
          if (senderEmail && process.env.SMTP_PASS) {
            console.log(`📤 Sending payment confirmation email to: ${userData.email}`);
          
          const mailOptions = {
            from: senderEmail,
            to: userData.email,
            subject: "Payment Confirmation - Booking Successful",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3399cc;">Payment Confirmed! 🎉</h2>
              <p>Dear ${userData.username || 'Guest'},</p>
              <p>Your payment has been successfully processed. Your booking is now confirmed!</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Details</h3>
                <p><strong>Booking ID:</strong> ${bookingDetails._id}</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
                <p><strong>Hotel Name:</strong> ${bookingDetails.hotel?.name || 'N/A'}</p>
                <p><strong>Location:</strong> ${bookingDetails.hotel?.address || 'N/A'}</p>
                <p><strong>Room Type:</strong> ${bookingDetails.room?.roomType || 'N/A'}</p>
                <p><strong>Check-in Date:</strong> ${new Date(bookingDetails.checkInDate).toLocaleDateString()}</p>
                <p><strong>Check-out Date:</strong> ${new Date(bookingDetails.checkOutDate).toLocaleDateString()}</p>
                <p><strong>Number of Guests:</strong> ${bookingDetails.guests}</p>
                <p><strong>Total Amount Paid:</strong> ${process.env.CURRENCY || '₹'} ${bookingDetails.totalPrice}</p>
                <p><strong>Payment Method:</strong> Razorpay (Online Payment)</p>
              </div>
              
              <p>We look forward to welcoming you!</p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
            </div>
            `
          };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Payment confirmation email sent successfully to ${userData.email}`);
            console.log("Email Response:", {
              messageId: info.messageId,
              accepted: info.accepted,
              rejected: info.rejected
            });
          } else {
            console.warn("⚠️ Email configuration incomplete - skipping payment confirmation email");
            if (!senderEmail) {
              console.warn("   Missing: SENDER_EMAIL or SMTP_USER");
            }
            if (!process.env.SMTP_PASS) {
              console.warn("   Missing: SMTP_PASS");
            }
          }
        }
      } catch (emailError) {
        // Log error but don't fail payment
        console.error("❌ Failed to send payment confirmation email");
        console.error("Error Details:", {
          message: emailError.message,
          code: emailError.code,
          response: emailError.response
        });
      }
    } else {
      if (!userData) {
        console.warn("⚠️ User not found - skipping payment confirmation email");
      } else if (!userData.email) {
        console.warn("⚠️ User email not found - skipping payment confirmation email");
      }
    }

    res.json({
      success: true,
      message: "Payment verified and processed successfully",
      paymentId,
      orderId,
      booking: booking
    });

  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message
    });
  }
};
