import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { registerHotel, getCities, getOwnerHotels, updateHotel } from "../controllers/hotelController.js"

const hotelRouter=express.Router()

hotelRouter.post('/',protect,registerHotel)
hotelRouter.get('/my', protect, getOwnerHotels)
hotelRouter.put('/:hotelId', protect, updateHotel)
hotelRouter.get('/cities',getCities) // Public endpoint to get all cities

export default hotelRouter;