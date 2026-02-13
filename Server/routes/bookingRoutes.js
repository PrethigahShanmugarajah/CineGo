import express from "express";
import {
  confirmPayment,
  createBooking,
  deleteBooking,
  getBooking,
  getOccupiedSeats,
  listBookings,
} from "../controllers/bookingController.js";
import authMiddleware from "../middlewares/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/booking-create", authMiddleware, createBooking);
bookingRouter.get("/booking-get", authMiddleware, getBooking);
bookingRouter.get("/booking-list", listBookings);
bookingRouter.delete("/booking-delete/:id", deleteBooking);
bookingRouter.get("/booking-get-occupied", getOccupiedSeats);
bookingRouter.get("/booking-confirm-payment", confirmPayment);

export default bookingRouter;
