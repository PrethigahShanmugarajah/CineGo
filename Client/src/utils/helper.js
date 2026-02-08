// CineGo / Client / src / utils / helper.js

/* -------- Placeholder image URL for movies without poster -------- */
export const PLACEHOLDER_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1920px-No-Image-Placeholder.svg.png";

/* -------- Get full URL for uploaded files or return original URL if already absolute -------- */
export const getUploadUrl = (maybeFilenameOrUrl) => {
  if (!maybeFilenameOrUrl) return null;
  if (typeof maybeFilenameOrUrl !== "string") return null;
  if (
    maybeFilenameOrUrl.startsWith("http://") ||
    maybeFilenameOrUrl.startsWith("https://")
  )
    return maybeFilenameOrUrl;
  return `${import.meta.env.VITE_BASEURL}/uploads/${maybeFilenameOrUrl.replace(/ûploads\//, "")}`;
};

/* -------- Map backend movie object to UI-friendly format -------- */
export const mapBackendMovieToUi = (m) => {
  const poster =
    m.poster || (m.latestTrailer && m.latestTrailer.thumbnail) || null;

  const image = getUploadUrl(poster) || PLACEHOLDER_IMG;

  const category =
    (Array.isArray(m.categories) && m.categories.join(", ")) ||
    (m.latestTrailer &&
      Array.isArray(m.latestTrailer.genres) &&
      m.latestTrailer.genres.join(", ")) ||
    "";

  return {
    id: m._id || m.id,
    title:
      m.movieName ||
      m.title ||
      (m.latestTrailer && m.latestTrailer.title) ||
      "Untitled",
    image,
    category,
    raw: m,
  };
};

/* -------- Rows configuration for cinema seats -------- */
export const ROWS = [
  { id: "A", type: "standard", count: 8 },
  { id: "B", type: "standard", count: 8 },
  { id: "C", type: "standard", count: 8 },
  { id: "D", type: "recliner", count: 8 },
  { id: "E", type: "recliner", count: 8 },
];

/* -------- Generate seat ID from row and number -------- */
export const seatId = (r, n) => `${r}${n}`;

/* -------- Total number of seats in cinema -------- */
export const TOTAL_SEATS = ROWS.reduce((s, r) => s + r.count, 0);

/* -------- Fallback avatar component for users without profile picture -------- */
export const FallbackAvatar = ({ className = "w-12 h-12", alt = "avatar" }) => (
  <div
    className={`${className} bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-300`}
    aria-hidden="true"
  >
    ?
  </div>
);

/* -------- Extract YouTube video ID from URL or return ID if given -------- */
export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  if (/^[A-Za-z0-9_-]{6,}$/.test(urlOrId)) return urlOrId;

  const re =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;

  const m = urlOrId.match(re);
  return m ? m[1] : null;
}

/* -------- Convert YouTube video ID to embed URL -------- */
export const getEmbedUrl = (id) =>
  id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
    : null;

/* -------- Get date parts (year, month, day, hour, minute) in a specific timezone -------- */
export const getParts = (dateLike, timeZone) => {
  const dt = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(dt);

  const map = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  map.dayPeriod = map.dayPeriod || map.ampm || map.AMPM;
  return map;
};

/* -------- Pad single digit number with leading zero -------- */
export const pad = (n) => String(n).padStart(2, "0");

/* -------- Format date as "YYYY-MM-DD" in specific timezone -------- */
export const formatDateKey = (dateLike, timeZone = "Asia/Colombo") => {
  const p = getParts(dateLike, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
};

/* -------- Format time with hour:minute and AM/PM in specific timezone -------- */
export const formatTimeInTZ = (dateLike, timeZone = "Asia/Colombo") => {
  const p = getParts(dateLike, timeZone);
  const hour = String(Number(p.hour));
  return `${hour}:${p.minute} ${String(
    p.dayPeriod ?? p.ampm ?? "",
  ).toUpperCase()}`;
};
