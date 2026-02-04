// CineGo / Server / models / movieModel.js
import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    file: { type: String, trim: true, default: null },
  },
  { _id: false },
);

const slotSchema = new mongoose.Schema(
  {
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    ampm: { type: String, enum: ["AM", "PM"], default: "AM" },
  },
  { _id: false },
);

const latestTrailerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    generes: [{ type: String }],
    duration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },
    year: { type: Number },
    description: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    description: { type: String, trim: true },
    videoId: { type: String, trim: true },

    directors: [personSchema],
    producers: [personSchema],
    signers: [personSchema],
  },
  { _id: false },
);

const movieSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["normal", "featured", "releaseSoon", "latestTrailers"],
      default: "normal",
    },
    movieName: { type: String, trim: true },
    categories: [{ type: String }],
    poster: { type: String, trim: true },
    trailerUrl: { type: String, trim: true },
    rating: { type: String, default: 0 },
    duration: { type: String, default: 0 },

    slots: [slotSchema],
    seatPrices: {
      standard: { type: Number, default: 0 },
      recliner: { type: Number, default: 0 },
    },

    auditorium: { type: String, trim: true, default: "Audi 1" },

    cast: [personSchema],
    directors: [personSchema],
    producers: [personSchema],
    story: { type: String, trim: true },
    latestTrailer: latestTrailerSchema,
  },
  { timestamps: true },
);

const Movie = mongoose.models.movie || mongoose.model("Movie", movieSchema);
export default Movie;
