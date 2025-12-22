import express from "express"
import { checkAvailabilityAPI, createBooking, getHotelBookings, getUserBookings, processPayment, verifyPayment } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter=express.Router();

bookingRouter.post('/check-availability',checkAvailabilityAPI);
bookingRouter.post('/book',protect,createBooking)
bookingRouter.get('/user',protect,getUserBookings)
bookingRouter.get('/hotel',protect,getHotelBookings);
bookingRouter.post('/payment/:bookingId',protect,processPayment);
bookingRouter.post('/verify-payment',protect,verifyPayment);

export default bookingRouter;