import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { registerHotel, getCities } from "../controllers/hotelController.js"

const hotelRouter=express.Router()

hotelRouter.post('/',protect,registerHotel)
hotelRouter.get('/cities',getCities) // Public endpoint to get all cities

export default hotelRouter;