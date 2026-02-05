// CineGo / Server / routes / bookingRoutes.js
import express from "express";
import { createBooking } from "../controllers/bookingController.js";
import authMiddleware from "../middlewares/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/booking-create", authMiddleware, createBooking);

export default bookingRouter;
