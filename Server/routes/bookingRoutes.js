// CineGo / Server / routes / bookingRoutes.js
import express from "express";
import {
  createBooking,
  deleteBooking,
  getBooking,
  listBookings,
} from "../controllers/bookingController.js";
import authMiddleware from "../middlewares/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/booking-create", authMiddleware, createBooking);
bookingRouter.get("/booking-get", authMiddleware, getBooking);
bookingRouter.get("/booking-list", listBookings);
bookingRouter.delete("/booking-delete/:id", deleteBooking);

export default bookingRouter;
