import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
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
        console.error(error.message)
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

export const createBooking=async(req,res)=>{
    try{
        const{room,checkInDate,checkOutDate,guests}=req.body;
        const user=req.user._id;

        //before booking check availability
        const isAvailable=await checkAvailability({
            checkInDate,
            checkOutDate,
            room
        });

        if(!isAvailable){
            return res.json({success:false,message: "room is not available"})
        }
        //get totalprice from room
        const roomData=await Room.findById(room).populate("hotel");
        let totalPrice=roomData.pricePerNight;

        //calculate totalprice based on night
        const checkIn=new Date(checkInDate)
        const checkOut=new Date(checkOutDate)
        const timeDiff=checkOut.getTime()-checkIn.getTime();
        const nights=Math.ceil(timeDiff/(1000*3600*24));

        totalPrice *=nights;
        const booking = await Booking.create({
            user,
            room,
            hotel:roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })
        res.json({success:  true,message: "booking created successfully"})
    }catch(error){
        res.json({success:  false,message: "failed to create booking"})
    }
}

//API to get all booking for a user
//get/api/bookings/user
export const getUserBookings=async(req,res)=>{
    try{
        const user=req.user._id;
        const bookings=await Booking.find({user}).populate("rooom hotel").sort({createAt: -1});
        res.json({success: true,bookings})
    }catch(error){
        res.json({success: false,message:"failed to fetch bookings"});

    }
}

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });

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
        totalBookings,
        totalRevenue
      }
    });

  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};
