// CineGo / Server / routes / bookingRoutes.js
import express from "express";
import { createBooking, getBooking } from "../controllers/bookingController.js";
import authMiddleware from "../middlewares/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/booking-create", authMiddleware, createBooking);
bookingRouter.get("/booking-get", authMiddleware, getBooking);

export default bookingRouter;
