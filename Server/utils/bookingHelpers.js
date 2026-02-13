import dotenv from "dotenv";
import mongoose from "mongoose";
import Stripe from "stripe";
dotenv.config();

export const CLIENT_URL = process.env.FRONTEND_URL;

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_API_VERSION = process.env.STRIPE_API_VERSION;

export const RECLINER_ROWS = new Set(["D", "E"]);
export const BLOCKING_STATUSES = [
  "pending",
  "paid",
  "confirmed",
  "active",
  "upcoming",
];

/* -------- Create Stripe instance or throw error if key missing -------- */
export function getStripeOrThrow() {
  if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });
}

/* -------- Normalize showtime to minute level (remove seconds & ms) -------- */
export function normalizeShowtimeToMinute(input) {
  let d = new Date(input);
  if (isNaN(d.getTime())) {
    try {
      d = new Date(decodeURIComponent(String(input)));
    } catch (error) {
      d = new Date(String(input));
    }
  }

  if (isNaN(d.getTime())) throw new Error("Invalid showtime");
  d.setSeconds(0, 0);
  return d;
}

/* -------- Build MongoDB match conditions for movie ID or name -------- */
export function buildMovieMatchClause(movieId, movieName) {
  const push = (arr, obj) => {
    if (obj && Object.keys(obj).length) arr.push(obj);
  };

  const clauses = [];

  if (movieId) {
    const mid = String(movieId).trim();
    if (mid) {
      if (mongoose.Types.ObjectId.isValid(mid)) {
        push(clauses, { "movie.id": new mongoose.Types.ObjectId(mid) });
        push(clauses, { movieId: new mongoose.Types.ObjectId(mid) });
      }

      push(clauses, { "movie.id": mid });
      push(clauses, { movieId: mid });
    }
  }

  if (movieName) {
    const mname = String(movieName).trim();
    if (mname) {
      push(clauses, { "movie.title": mname });
      push(clauses, { movieName: mname });
      push(clauses, { "movie.movieName": mname });
    }
  }

  const seen = new Set();
  const unique = [];
  for (const c of clauses) {
    const k = JSON.stringify(c);
    if (!seen.has(k)) {
      seen.add(k);
      unique.push(c);
    }
  }

  return unique;
}

/* -------- Calculate total amount in paise based on selected seats -------- */
export function computeTotalPaiseFromSeats(
  movie = {},
  seats = [],
  options = {},
) {
  const allowClientPrice = options.allowClientPrice === true;
  const standardRupee =
    Number(movie?.seatPrices?.standard ?? movie?.price ?? 0) || 0;
  const standardPaise = Math.round(standardRupee * 100);
  const reclinerDefined =
    typeof movie?.seatPrices?.recliner !== "undefined" &&
    movie?.seatPrices?.recliner !== null;
  const reclinerPaise = reclinerDefined
    ? Math.round(Number(movie.seatPrices.recliner) * 100)
    : Math.round(standardPaise * 1.5);

  let total = 0;
  for (const s of seats) {
    if (!s) continue;
    if (
      allowClientPrice &&
      typeof s === "object" &&
      s.price !== undefined &&
      s.price !== null
    ) {
      const p = Number(s.price);
      if (!Number.isNaN(p) && p >= 0) {
        total += Math.round(p * 100);
        continue;
      }
    }

    let seatId =
      typeof s === "string" ? s : String(s.seatId || s.id || s.name || "");
    seatId = String(seatId).trim();
    if (!seatId) continue;
    const row = seatId.charAt(0).toUpperCase();
    total += RECLINER_ROWS.has(row) ? reclinerPaise : standardPaise;
  }

  return Math.max(0, Math.round(total));
}

/* -------- Normalize seat input into standard seat objects -------- */
export function normalizeSeatsFromInput(
  rawSeats = [],
  seatIdsFromBody = [],
  movie = {},
) {
  const normalized = [];
  const deriveServerPrice = (row) => {
    const isRecliner = RECLINER_ROWS.has(row);
    const base = Number(movie?.seatPrices?.standard ?? movie?.price ?? 0);
    if (isRecliner)
      return Number(movie?.seatPrices?.recliner ?? Math.round(base * 1.5));
    return base;
  };

  if (Array.isArray(rawSeats) && rawSeats.length > 0) {
    if (typeof rawSeats[0] === "object") {
      for (const s of rawSeats) {
        const seatIdVal = String(s.seatId || s.id || s)
          .trim()
          .toUpperCase();

        if (!seatIdVal) continue;
        const row = seatIdVal.charAt(0).toUpperCase();
        const type =
          s.type || (RECLINER_ROWS.has(row) ? "recliner" : "standard");

        let price = 0;
        if (s.price !== undefined && s.price !== null) {
          const p = Number(s.price);
          if (!Number.isNaN(p) && p >= 0) price = p;
        } else price = deriveServerPrice(row);
        normalized.push({ seatId: seatIdVal, type, price });
      }
    } else {
      for (const sid of rawSeats) {
        const seatIdVal = String(sid).trim().toUpperCase();
        if (!seatIdVal) continue;
        const row = seatIdVal.charAt(0).toUpperCase();
        const type = RECLINER_ROWS.has(row) ? "recliner" : "standard";
        normalized.push({
          seatId: seatIdVal,
          type,
          price: deriveServerPrice(row),
        });
      }
    }
  } else if (Array.isArray(seatIdsFromBody) && seatIdsFromBody.length > 0) {
    for (const sid of seatIdsFromBody) {
      const seatIdVal = String(sid).trim().toUpperCase();
      if (!seatIdVal) continue;
      const row = seatIdVal.charAt(0).toUpperCase();
      const type = RECLINER_ROWS.has(row) ? "recliner" : "standard";
      normalized.push({
        seatId: seatIdVal,
        type,
        price: deriveServerPrice(row),
      });
    }
  }
  return normalized;
}
