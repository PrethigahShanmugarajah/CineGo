// CineGo / Server / controllers / movieController.js
import mongoose from "mongoose";
import Movie from "../models/movieModel.js";
import {
  buildLatestTrailerPeople,
  extractFilenameFromUrl,
  getUploadUrl,
  normalizeItemForOutput,
  safeParseJSON,
  tryUnlinkUploadUrl,
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
      recliner: Number(body.recliner || 0),
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

    // attachLFiles("ltDirectorFiles", "directors");
    // attachLFiles("ltProducerFiles", "producers");
    // attachLFiles("ltSingerFiles", "singers");

    attachLFiles("ltDirectorImages", "directors");
    attachLFiles("ltProducerImages", "producers");
    attachLFiles("ltSingerImages", "singers");

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

    let successMessage = "Movie created successfully!";

    switch (savedMovie.type) {
      case "featured":
        successMessage = "Featured movie created successfully!";
        break;
      case "releaseSoon":
        successMessage = "Release Soon movie created successfully!";
        break;
      case "latestTrailers":
        successMessage = "Latest Trailer created successfully!";
        break;
    }

    return res.status(201).json({
      success: true,
      message: successMessage,
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

/* -------- Get All Movies -------- */
export const getMovies = async (req, res) => {
  try {
    const {
      category,
      type,
      sort = "-createdAt",
      page = 1,
      limit = 12,
      search,
      latestTrailer,
    } = req.query;

    let filter = {};

    if (typeof category === "string" && category.trim())
      filter.categories = { $in: [category.trim()] };
    if (typeof type === "string" && type.trim()) filter.type = type.trim();
    if (typeof search === "string" && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { movieName: { $regex: q, $options: "i" } },
        { "latestTrailer.title": { $regex: q, $options: "i" } },
        { story: { $regex: q, $options: "i" } },
      ];
    }

    if (latestTrailer && String(latestTrailer).toLowerCase() !== "false") {
      filter =
        Object.keys(filter).length === 0
          ? { type: "latestTrailers" }
          : { $and: [filter, { type: "latestTrailers" }] };
    }

    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, parseInt(limit, 10) || 12);
    const skip = (pg - 1) * lim;

    const total = await Movie.countDocuments(filter);

    if (total === 0) {
      return res.status(200).json({
        success: true,
        message: "No movies found.",
        total: 0,
        page: pg,
        limit: lim,
        items: [],
      });
    }

    const items = await Movie.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(lim)
      .lean();

    const normalized = (items || []).map(normalizeItemForOutput);

    let successMessage = "Movies fetched successfully!";
    const movieType = type?.trim();

    switch (movieType) {
      case "featured":
        successMessage = "Featured movies fetched successfully!";
        break;
      case "releaseSoon":
        successMessage = "Release Soon movies fetched successfully!";
        break;
      case "latestTrailers":
        successMessage = "Latest trailers fetched successfully!";
        break;
    }

    return res.json({
      success: true,
      message: successMessage,
      total,
      page: pg,
      limit: lim,
      items: normalized,
    });
  } catch (error) {
    console.error("Get All Movies Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies.",
      error: `Get All Movies Error: ${error.message}`,
    });
  }
};

/* -------- Get a Movie -------- */
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Movie ID is required." });
    }

    const item = await Movie.findById(id).lean();
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found." });
    }

    const objmov = normalizeItemForOutput(item);

    if (item.type === "latestTrailers" && item.latestTrailer) {
      const lt = item.latestTrailer;
      objmov.genres = objmov.genres || lt.genres || [];
      objmov.year = objmov.year || lt.year || null;
      objmov.rating = objmov.rating || lt.rating || null;
      objmov.duration = objmov.duration || lt.duration || null;
      objmov.description =
        objmov.description ||
        lt.description ||
        lt.excerpt ||
        objmov.description ||
        "";
    }

    const messages = {
      normal: "Movie fetched successfully!",
      featured: "Featured movie fetched successfully!",
      releaseSoon: "Release Soon movie fetched successfully!",
      latestTrailers: "Latest trailer fetched successfully!",
    };

    const successMessage = messages[item.type] || "Movie fetched successfully!";

    return res.status(200).json({
      success: true,
      message: successMessage,
      item: objmov,
    });
  } catch (error) {
    console.error("Get a Movie Error:", error.message);

    return res.status(error?.name === "CastError" ? 400 : 500).json({
      success: false,
      message:
        error?.name === "CastError"
          ? "Invalid movie ID."
          : "Failed to fetch the movie.",
      error: `Get a Movie Error: ${error.message}`,
    });
  }
};

/* -------- Delete a Movie -------- */
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Movie ID is required." });
    }

    const m = await Movie.findById(id).lean();
    if (!m) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found." });
    }

    if (m.poster) tryUnlinkUploadUrl(m.poster);
    if (m.latestTrailer && m.latestTrailer.thumbnail)
      tryUnlinkUploadUrl(m.latestTrailer.thumbnail);

    [m.cast || [], m.directors || [], m.producers || []].forEach((arr) =>
      arr.forEach((p) => {
        if (p && p.file) tryUnlinkUploadUrl(p.file);
      }),
    );

    if (m.latestTrailer) {
      [
        ...(m.latestTrailer.directors || []),
        ...(m.latestTrailer.producers || []),
        ...(m.latestTrailer.singers || []),
      ].forEach((p) => {
        if (p && p.file) tryUnlinkUploadUrl(p.file);
      });
    }

    await Movie.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: `${m.movieName} movie deleted successfully!`,
    });
  } catch (error) {
    console.error("Delete a Movie Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete the movie.",
      error: `Delete a Movie Error: ${error.message}`,
    });
  }
};
