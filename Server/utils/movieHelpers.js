// CineGo / Server / utils / movieHelpers.js
import path from "path";
import fs from "fs";

/* -------- Convert file name to full upload URL -------- */
export const getUploadUrl = (val) => {
  const API_BASE = process.env.API_URL;

  if (!val) return null;
  if (typeof val === "string" && /^(https?:\/\/)/.test(val)) return val;
  const cleaned = String(val).replace(/^uploads\//, "");
  if (!cleaned) return null;
  return `${API_BASE}/uploads/${cleaned}`;
};

/* -------- Get only the file name from URL or path -------- */
export const extractFilenameFromUrl = (u) => {
  if (!u || typeof u !== "string") return null;
  const parts = u.split("/uploads/");
  if (parts[1]) return parts[1];
  if (u.startsWith("uploads/")) return u.replace(/^uploads\//, "");
  return /^[^\/]+\.[a-zA-Z0-9]+$/.test(u) ? u : null;
};

/* -------- Delete file from uploads folder if exists -------- */
export const tryUnlinkUploadUrl = (urlOrFilename) => {
  const fn = extractFilenameFromUrl(urlOrFilename);
  if (!fn) return;
  const filepath = path.join(process.cwd(), "uploads", fn);
  fs.unlink(filepath, (error) => {
    if (error)
      console.warn("Failed to unlink file", filepath, error?.message || error);
  });
};

/* -------- Safely convert JSON string to object -------- */
export const safeParseJSON = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch (error) {
    return null;
  }
};

/* -------- Convert person image value to clean file name -------- */
export const normalizeLatestPersonFilename = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const fn = extractFilenameFromUrl(value);
    return fn || value;
  }
  if (typeof value === "object") {
    const candidate =
      value.filename ||
      value.path ||
      value.url ||
      value.file ||
      value.image ||
      value.preview ||
      null;
    return candidate ? normalizeLatestPersonFilename(candidate) : null;
  }
  return null;
};

/* -------- Convert person object to preview format -------- */
export const personToPreview = (p) => {
  if (!p) return { name: "", preview: null };
  const candidate = p.preview || p.file || p.image || p.url || null;
  return {
    name: p.name || "",
    role: p.role || "",
    preview: candidate ? getUploadUrl(candidate) : null,
  };
};

/* -------- Prepare people data for latest trailer -------- */
export const buildLatestTrailerPeople = (arr = []) =>
  (arr || []).map((p) => ({
    name: (p && p.name) || "",
    role: (p && p.role) || "",
    file: normalizeLatestPersonFilename(
      p && (p.file || p.preview || p.url || p.image),
    ),
  }));

/* -------- Add full URLs and clean data for trailer output -------- */
export const enrichLatestTrailerForOutput = (lt = {}) => {
  const copy = { ...lt };
  copy.thumbnail = copy.thumbnail
    ? getUploadUrl(copy.thumbnail)
    : copy.thumbnail || null;

  const mapPerson = (p) => {
    const c = { ...(p || {}) };
    c.preview = c.file
      ? getUploadUrl(c.file)
      : c.preview
        ? getUploadUrl(c.preview)
        : null;

    c.name = c.name || "";
    c.role = c.role || "";
    return c;
  };

  copy.directors = (copy.directors || []).map(mapPerson);
  copy.producers = (copy.producers || []).map(mapPerson);
  copy.singers = (copy.singers || []).map(mapPerson);
  return copy;
};

/* -------- Final cleanup of movie data before response -------- */
export const normalizeItemForOutput = (it = {}) => {
  const obj = { ...it };
  obj.thumbnail = it.latestTrailer?.thumbnail
    ? getUploadUrl(it.latestTrailer.thumbnail)
    : it.poster
      ? getUploadUrl(it.poster)
      : null;

  obj.trailerUrl =
    it.trailerUrl || it.latestTrailer?.url || it.latestTrailer?.videoId || null;

  if (it.type === "latestTrailers" && it.latestTrailer) {
    const lt = it.latestTrailer;
    obj.genres = obj.genres || lt.genres || [];
    obj.year = obj.year || lt.year || null;
    obj.rating = obj.rating || lt.rating || null;
    obj.duration = obj.duration || lt.duration || null;
    obj.description = obj.description || lt.description || lt.excerpt || "";
  }

  obj.cast = (it.cast || []).map(personToPreview);
  obj.directors = (it.directors || []).map(personToPreview);
  obj.producers = (it.producers || []).map(personToPreview);

  if (it.latestTrailer)
    obj.latestTrailer = enrichLatestTrailerForOutput(it.latestTrailer);

  obj.auditorium = it.auditorium || null;

  return obj;
};
