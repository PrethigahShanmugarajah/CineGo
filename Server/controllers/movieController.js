// CineGo / Server / controllers / movieController.js
import mongoose from "mongoose";
import Movie from "../models/movieModel.js";
import {
  buildLatestTrailerPeople,
  extractFilenameFromUrl,
  getUploadUrl,
  safeParseJSON,
} from "../utils/movieHelpers.js";

/* -------- Create a Movie -------- */
export const createMovie = async (req, res) => {
  try {
    const body = req.body || {};

    const posterUrl = req.files?.poster?.[0]?.filename
      ? getUploadUrl(req.files.poster[0].filename)
      : body.poster || null;
    const trailerUrl = req.files?.trailerUrl?.[0]?.filename
      ? getUploadUrl(req.files.trailerUrl[0].filename)
      : body.poster || null;
    const videoUrl = req.files?.videoUrl?.[0]?.filename
      ? getUploadUrl(req.files.videoUrl[0].filename)
      : body.poster || null;

    const categories =
      safeParseJSON(body.categories) ||
      (body.categories
        ? String(body.categories)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []);
    const slots = safeParseJSON(body.slots) || [];
    const seatPrices = safeParseJSON(body.seatPrices) || {
      standard: Number(body.standard || 0),
      recliner: Number(body, recliner || 0),
    };

    const cast = safeParseJSON(body.cast) || [];
    const directors = safeParseJSON(body.directors) || [];
    const producers = safeParseJSON(body.producers) || [];

    const attachFiles = (
      filesArrName,
      targetArr,
      toFilename = (f) => getUploadUrl(f),
    ) => {
      if (!req.files?.[filesArrName]) return;
      req.files[filesArrName].forEach((file, idx) => {
        if (targetArr[idx]) targetArr[idx].file = toFilename(file.filename);
        else targetArr[idx] = { name: "", file: toFilename(file.filename) };
      });
    };

    attachFiles("castFiles", cast);
    attachFiles("directorFiles", directors);
    attachFiles("producerFiles", producers);

    const latestTrailerBody = safeParseJSON(body.latestTrailer) || {};
    if (req.files?.ltThumbnail?.[0]?.filename)
      latestTrailerBody.thumbnail = req.files.ltThumbnail[0].filename;
    else if (body.ltThumbnail) {
      const fn = extractFilenameFromUrl(body.ltThumbnail);
      latestTrailerBody.thumbnail = fn ? fn : body.ltThumbnail;
    }

    if (body.ltVideoUrl) latestTrailerBody.videoId = body.ltVideoUrl;
    if (body.ltUrl) latestTrailerBody.url = body.ltUrl;
    if (body.ltTitle) latestTrailerBody.title = body.ltTitle;

    latestTrailerBody.directors = latestTrailerBody.directors || [];
    latestTrailerBody.producers = latestTrailerBody.producers || [];
    latestTrailerBody.singers = latestTrailerBody.singers || [];

    const attachLFiles = (filedName, arrName) => {
      if (!req.files?.[filedName]) return;
      req.files[filedName].forEach((file, idx) => {
        const filename = file.filename;
        if (latestTrailerBody[arrName][idx])
          latestTrailerBody[arrName][idx].file = filename;
        else latestTrailerBody[arrName][idx] = { name: "", file: filename };
      });
    };

    attachLFiles("ltDirectorFiles", "directors");
    attachLFiles("ltProducerFiles", "producers");
    attachLFiles("ltSingerFiles", "singers");

    latestTrailerBody.directors = buildLatestTrailerPeople(
      latestTrailerBody.directors,
    );
    latestTrailerBody.producers = buildLatestTrailerPeople(
      latestTrailerBody.producers,
    );
    latestTrailerBody.singers = buildLatestTrailerPeople(
      latestTrailerBody.singers,
    );

    const auditoriumValue =
      typeof body.auditorium === "string" && body.auditorium.trim()
        ? String(body.auditorium).trim()
        : "Audi 1";

    const doc = new Movie({
      _id: new mongoose.Types.ObjectId(),
      type: body.type || "normal",
      movieName: body.movieName || body.title || "",
      categories,
      poster: posterUrl,
      trailerUrl,
      videoUrl,
      rating: Number(body.rating) || 0,
      duration: Number(body.duration) || 0,
      slots,
      seatPrices,
      cast,
      directors,
      producers,
      story: body.story || "",
      latestTrailer: latestTrailerBody,
      auditorium: auditoriumValue,
    });

    const savedMovie = await doc.save();
    return res
      .status(201)
      .json({
        success: true,
        message: "Movie created successfully!",
        data: savedMovie,
      });
  } catch (error) {
    console.error("Create a Movie Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create a movie.",
      error: `Create a Movie Error: ${error.message}`,
    });
  }
};
