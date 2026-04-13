import express from "express";
import { getTravelRecommendations } from "../controllers/aiController.js";

const aiRouter = express.Router();
aiRouter.post('/recommend', getTravelRecommendations);

export default aiRouter;
