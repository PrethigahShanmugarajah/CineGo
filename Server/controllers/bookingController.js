// CineGo / Server / controllers / bookingController.js
import dotenv from "dotenv";
import {
  BLOCKING_STATUSES,
  buildMovieMatchClause,
  CLIENT_URL,
  computeTotalPaiseFromSeats,
  getStripeOrThrow,
  normalizeSeatsFromInput,
  normalizeShowtimeToMinute,
} from "../utils/bookingHelpers.js";
import mongoose from "mongoose";
import Movie from "../models/movieModel.js";
import Booking from "../models/bookingModel.js";
dotenv.config();

/* -------- Create a Booking -------- */
export const createBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required to create a booking.",
      });
    }

    const body = req.body || {};
    const movieId = body.movieId || null;
    const movieName = body.movieName || body.movie?.title || "";
    const auditorium = body.audi || body.auditorium || "Audi 1";

    const rawSeats = Array.isArray(body.seats)
      ? body.seats.filter(Boolean)
      : [];

    const seatIdsFromBody = Array.isArray(body.seats)
      ? body.seats.filter(Boolean)
      : [];

    const customer = String(
      body.customer ||
        (req.user && (req.user.name || req.user.fullName)) ||
        "Guest",
    );

    const email = String(body.email || (req.user && req.user.email) || "");
    const paymentMethod = String(body.paymentMethod || "card").toLowerCase();
    const currency = String(body.currency || "lkr").toLowerCase();

    // if (!body.showtime ||(rawSeats.length === 0 && seatIdsFromBody.length === 0) ||!email) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Missing required fields (showtime/seats/email).",
    //   });
    // }

    if (!body.showtime) {
      return res.status(400).json({
        success: false,
        message: "Showtime is required.",
      });
    }

    if (rawSeats.length === 0 && seatIdsFromBody.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one seat must be selected.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    let showtime;
    try {
      showtime = normalizeShowtimeToMinute(body.showtime);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid showtime.",
      });
    }

    let movie = null;
    if (movieId && mongoose.Types.ObjectId.isValid(String(movieId))) {
      movie = await Movie.findById(movieId)
        .lean()
        .exec()
        .catch(() => null);
    } else if (movieName) {
      movie = await Movie.findOne({
        $or: [{ title: movieName }, { movieName }],
      })
        .lean()
        .exec()
        .catch(() => null);
    }

    const normalizedSeats = normalizeSeatsFromInput(
      rawSeats,
      seatIdsFromBody,
      movie,
    );

    if (normalizedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid seats provided.",
      });
    }

    const totalPaise = computeTotalPaiseFromSeats(movie, normalizedSeats, {
      allowClientPrice: true,
    });

    // if (!totalPaise || totalPaise <= 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Computed amount is zero.",
    //   });
    // }

    if (!totalPaise) {
      return res.status(400).json({
        success: false,
        message: "Total amount is missing.",
      });
    }

    if (totalPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Computed amount must be greater than zero.",
      });
    }

    const totalMain = Number((totalPaise / 100).toFixed(2));

    const startWindow = new Date(showtime);
    const endWindow = new Date(startWindow.getTime() + 60 * 1000);
    const conflictQuery = {
      showtime: { $gte: startWindow, $lt: endWindow },
      auditorium,
      status: { $in: BLOCKING_STATUSES },
    };

    const movieClauses = buildMovieMatchClause(movieId, movieName);
    if (movieClauses.length > 0) conflictQuery.$or = movieClauses;

    const existingBookings = await Booking.find(conflictQuery, { seats: 1 })
      .lean()
      .exec();
    const occupiedSeats = new Set();

    for (const b of existingBookings || []) {
      const seats = Array.isArray(b.seats) ? b.seats : [];
      for (const seat of seats) {
        const seatId =
          typeof seat === "string"
            ? seat.trim().toUpperCase()
            : (seat?.seatId || seat?.id || "").toString().trim().toUpperCase();
        if (seatId) occupiedSeats.add(seatId);
      }
    }

    const seatIdList = Array.from(
      new Set(normalizedSeats.map((s) => s.seatId)),
    );
    const conflictingSeats = seatIdList.filter((s) => occupiedSeats.has(s));

    const movieSnapShot = movie
      ? {
          id: movie._id,
          title: movie.movieName || movie.title || "",
          poster: movie.poster || movie.thumbnail || "",
          category: Array.isArray(movie.categories)
            ? movie.categories[0] || ""
            : movie.category || "",
          durationMins: movie.duration || movie.runtime || 0,
          rating: movie.rating || null,
        }
      : {
          id:
            movieId && mongoose.Types.ObjectId.isValid(String(movieId))
              ? new mongoose.Types.ObjectId(movieId)
              : undefined,
          title: movieName || "",
          poster: "",
          category: "",
          durationMins: 0,
        };

    const doc = {
      userId:
        req.user && req.user._id
          ? new mongoose.Types.ObjectId(req.user._id)
          : undefined,
      customer,
      movie: movieSnapShot,
      movieId: movieSnapShot.id,
      movieName: movieSnapShot.title,
      showtime,
      auditorium,
      seats: normalizedSeats,
      basePrice: movie?.seatPrices?.standard ?? movie?.price ?? 0,
      amount: totalMain,
      amountPaise: totalPaise,
      currency: (currency || "LKR").toUpperCase(),
      status: paymentMethod === "card" ? "pending" : "confirmed",
      paymentStatus: paymentMethod === "card" ? "pending" : "paid",
      paymentMethod,
      meta: { rawRequest: { seatIds: seatIdList, clientSeats: rawSeats } },
    };

    const booking = await Booking.create(doc);

    if (paymentMethod === "card") {
      let stripe;

      try {
        stripe = getStripeOrThrow();
      } catch (error) {
        await Booking.findByIdAndDelete(booking._id).catch(() => {});
        return res.status(500).json({
          success: false,
          message: "Payment is not configured.",
          error: error.message,
        });
      }

      try {
        const amountPaiseForStripe = Number(doc.amountPaise);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name: booking.movie.title || "Movie Booking",
                  description: `Seats: ${seatIdList.join(",")} - ${auditorium}`,
                },
                unit_amount: amountPaiseForStripe,
              },
              quantity: 1,
            },
          ],

          success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${CLIENT_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
          metadata: {
            bookingId: String(booking._id),
            seats: JSON.stringify(seatIdList),
            auditorium,
            showtime: showtime.toISOString(),
          },
        });

        booking.paymentSessionId = session.id;
        booking.stripeSession = { id: session.id, url: session.url || null };

        await Booking.findByIdAndUpdate(booking._id, {
          paymentSessionId: session.id,
          stripeSession: booking.stripeSession,
        }).exec();

        return res.status(201).json({
          success: true,
          message: "Booking created (pending payment).",
          booking: {
            id: booking._id,
            status: booking.status,
            amount: doc.amount,
            amountPaise: doc.amountPaise,
            currency: doc.currency,
          },
          checkout: { id: session.id, url: session.url },
        });
      } catch (stripeError) {
        await Booking.findByIdAndDelete(booking._id).catch(() => {});
        return res.status(500).json({
          success: false,
          message: "Failed to create Stripe session.",
          error: String(stripeError.message || stripeError.error),
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      booking: {
        id: booking._id,
        status: booking.status,
        amount: booking.amount,
        amountPaise: booking.amountPaise,
        currency: booking.currency,
      },
    });
  } catch (error) {
    console.error("Creating a Booking Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create a booking.",
      error: `Creating a Booking Error: ${error.message}`,
    });
  }
};

/* -------- Get All Bookings -------- */
export const getBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to fetch bookings.",
      });
    }

    const userId = String(req.user._id || req.user.id);
    const { paymentStatus, status } = req.query;

    const q = { userId };

    if (paymentStatus && String(paymentStatus).toLowerCase() !== "all") {
      q.paymentStatus = String(paymentStatus).toLowerCase();
    } else if (status && String(status).toLowerCase() !== "all") {
      q.status = String(status).toLowerCase();
    } else {
      q.paymentStatus = "paid";
    }

    const items = await Booking.find(q).sort({ createdAt: -1 }).lean().exec();

    // if (!items || items.length === 0) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "No bookings found.",
    //     items: [],
    //   });
    // }

    if (!items) {
      return res.status(200).json({
        success: true,
        message: "No bookings found.",
        items: [],
      });
    }

    if (items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No bookings found.",
        items: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully!",
      items,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
      error: `Get All Bookings Error: ${error.message}`,
    });
  }
};

/* -------- List Bookings -------- */
export const listBookings = async (req, res) => {
  try {
    const { movieId, page = 1, limit = 100, paymentStatus, status } = req.query;
    const q = {};

    if (movieId) {
      if (mongoose.Types.ObjectId.isValid(String(movieId)))
        q.movieId = new mongoose.Types.ObjectId(String(movieId));
      else q.movieName = String(movieId);
    }

    if (paymentStatus && String(paymentStatus).toLowerCase() !== "all") {
      q.paymentStatus = String(paymentStatus).toLowerCase();
    } else if (status && String(status).toLowerCase() !== "all") {
      q.status = String(status).toLowerCase();
    } else {
      q.paymentStatus = "paid";
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(1000, Number(limit) || 100);
    const total = await Booking.countDocuments(q).exec();

    if (total === 0) {
      return res.status(200).json({
        success: true,
        message: "No bookings found.",
        total: 0,
        page: pg,
        limit: lim,
        items: [],
      });
    }

    const items = await Booking.find(q)
      .sort({ createdAt: -1 })
      .skip((pg - 1) * lim)
      .limit(lim)
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully!",
      total,
      page: pg,
      limit: lim,
      items,
    });
  } catch (error) {
    console.error("List Bookings Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
      error: `List Bookings Error: ${error.message}`,
    });
  }
};

/* -------- Delete Booking -------- */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid ID.",
    //   });
    // }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const b = await Booking.findByIdAndDelete(id).lean().exec();

    if (!b) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Booking Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete the booking.",
      error: `Delete Booking Error: ${error.message}`,
    });
  }
};

/* -------- Get Occupied Seats -------- */
export const getOccupiedSeats = async (req, res) => {
  try {
    const {
      movieId,
      movieName,
      showtime: showtimeRaw,
      audi: audiRaw,
    } = req.query;

    if (!showtimeRaw) {
      return res.status(400).json({
        success: false,
        message: "Showtime query parameter is required.",
      });
    }

    const auditorium = String(audiRaw || req.query.auditorium || "Audi 1");
    let parsed;
    try {
      parsed = normalizeShowtimeToMinute(showtimeRaw);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid showtime.",
      });
    }

    const start = new Date(parsed);
    const end = new Date(start.getTime() + 60 * 1000);
    const q = {
      showtime: { $gte: start, $lt: end },
      auditorium,
      status: { $in: BLOCKING_STATUSES },
    };
    const movieClauses = buildMovieMatchClause(movieId, movieName);

    if (movieClauses.length > 0) q.$or = movieClauses;

    if (!Booking) {
      console.error("Booking model undefined.");
      return res.status(500).json({
        success: false,
        message: "Server misconfiguration (Booking model).",
      });
    }

    const docs = await Booking.find(q, { seats: 1 }).lean().exec();
    const occupiedSet = new Set();

    for (const d of docs || []) {
      const sarr = Array.isArray(d.seats) ? d.seats : [];
      for (const s of sarr) {
        if (!s) continue;
        let seatId = "";
        if (typeof s === "string") seatId = s.trim().toUpperCase();
        else if (s.seatId) seatId = String(s.seatId).trim().toUpperCase();
        else if (s.id) seatId = String(s.id).trim().toUpperCase();
        else if (s.number) seatId = String(s.number).trim().toUpperCase();
        if (seatId) occupiedSet.add(seatId);
      }
    }

    if (occupiedSet.size === 0) {
      return res.status(200).json({
        success: true,
        message: "No occupied seats found.",
        occupied: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Occupied seats fetched successfully!",
      occupied: [...occupiedSet],
    });
  } catch (error) {
    console.error("Get Occupied Seats Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get occupied seats.",
      error: `Get Occupied Seats Error: ${error.message}`,
    });
  }
};

/* -------- Confirm Payment -------- */
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id is required.",
      });
    }

    let stripe;
    try {
      stripe = getStripeOrThrow();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Payment is not configured.",
        error: error.message,
      });
    }

    const sessionObj = await stripe.checkout.sessions.retrieve(session_id);
    if (!sessionObj) {
      return res.status(404).json({
        success: false,
        message: "Failed to find the session.",
      });
    }

    if (sessionObj.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment is not completed.",
      });
    }

    const bookingId = sessionObj.metadata?.bookingId;
    // if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid bookingId in session metadata.",
    //   });
    // }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is missing in session metadata.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bookingId in session metadata.",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        status: "confirmed",
        paymentIntentId: sessionObj.payment_intent || "",
      },
      { new: true },
    ).exec();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this session.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully!",
      booking,
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm payment.",
      error: `Confirm Payment Error: ${error.message}`,
    });
  }
};
