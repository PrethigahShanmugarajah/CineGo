// CineGo / Client / src / utils / helper.jsx

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
  return `${import.meta.env.VITE_BASEURL}/uploads/${maybeFilenameOrUrl.replace(/uploads\//, "")}`;
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

/* -------- Default number of movies to show before collapse -------- */
export const COLLAPSE_COUNT = 12;

/* -------- Movie categories for filtering -------- */
export const categories = [
  { id: "all", name: "All Movies" },
  { id: "action", name: "Action" },
  { id: "horror", name: "Horror" },
  { id: "comedy", name: "Comedy" },
  { id: "adventure", name: "Adventure" },
];

/* -------- Duplicate categories list (used for dropdowns / UI lists) -------- */
export const categoriesList = [
  { id: "all", name: "All Movies" },
  { id: "action", name: "Action" },
  { id: "horror", name: "Horror" },
  { id: "comedy", name: "Comedy" },
  { id: "adventure", name: "Adventure" },
];

/* -------- Map backend movie object to UI-friendly format -------- */
export const mapBackendMovie = (m) => {
  const id = m._id || m.id || "";
  const title = m.movieName || m.title || "Untitled";
  const rawing = m.poster || m.latestTrailer?.thumbnail || m.thumbnail || null;
  const image = getUploadUrl(rawing) || PLACEHOLDER_IMG;

  const cat =
    (Array.isArray(m.categories) && m.categories[0]) ||
    m.category ||
    (Array.isArray(m.latestTrailer?.genres) && m.latestTrailer.genres[0]) ||
    "General";

  const category = String(cat || "General");

  return { id, title, image, category, raw: m };
};

/* -------- Get full URL for trailer-related files (supports string or object inputs) -------- */
export const getUploadUrlTrailer = (input) => {
  if (!input) return null;

  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("http://"))
      return input;

    return `${import.meta.env.VITE_BASEURL}/uploads/${input}`;
  }

  if (typeof input === "object") {
    const possible =
      input.url ||
      input.path ||
      input.filename ||
      input.file ||
      input.image ||
      "";

    if (possible) return getUploadUrlTrailer(possible);
  }
};

/* -------- Format duration into a readable string (supports object, number, or string) -------- */
export const formatDuration = (dur) => {
  if (!dur) return "";
  if (typeof dur === "string") return dur;
  if (typeof dur === "number") return `${dur}m`;

  const h = dur.hours ?? 0;
  const m = dur.minutes ?? 0;
  if (h && m) return `${h} h ${m}m`;
  if (h) return `${h} h`;
  if (m) return `${m}m`;
  return "";
};

/* -------- Placeholder image for cast/credit avatars (director/producer/singer) -------- */
export const PLACEHOLDER_THUMB =
  "https://img.freepik.com/premium-vector/profile-icon-vector-image-can-be-used-ui_120816-260932.jpg?semt=ais_hybrid&w=740&q=80";

/* -------- Map backend movie object to trailer UI item (title/thumbnail/video/genre/credits) -------- */
export const mapMovieToTrailerItem = (movie) => {
  const lt = movie.latestTrailer || {};
  const title = lt.title || movie.movieName || movie.title || "Untitled";

  const thumbnail =
    getUploadUrlTrailer(lt.thumbnail) ||
    getUploadUrlTrailer(movie.poster) ||
    PLACEHOLDER_IMG;

  const videoUrl =
    lt.videoId || lt.videoUrl || movie.trailerUrl || movie.videoUrl || "";

  const duration = lt.duration
    ? formatDuration(lt.duration)
    : movie.duration
      ? formatDuration(movie.duration)
      : "";

  const year = lt.year || movie.year || "";

  const genre =
    lt.generes && lt.generes.length
      ? lt.generes.join(", ")
      : movie.categories && movie.categories.length
        ? movie.categories.join(",")
        : "";

  const description = lt.description || movie.story || "";

  const credits = {};
  const firstDirector = (lt.directors || movie.directors || []).find(Boolean);
  const firstProducer = (lt.producers || movie.producers || []).find(Boolean);
  const firstSinger = (lt.singers || movie.singers || []).find(Boolean);

  if (firstDirector) {
    credits["Director"] = {
      name: firstDirector.name || "Unknown",
      image:
        getUploadUrlTrailer(firstDirector.file) ||
        getUploadUrlTrailer(firstDirector.image) ||
        getUploadUrlTrailer(firstDirector.photo) ||
        PLACEHOLDER_THUMB,
    };
  }

  if (firstProducer) {
    credits["Producer"] = {
      name: firstProducer.name || "Unknown",
      image:
        getUploadUrlTrailer(firstProducer.file) ||
        getUploadUrlTrailer(firstProducer.image) ||
        getUploadUrlTrailer(firstProducer.photo) ||
        PLACEHOLDER_THUMB,
    };
  }

  if (firstSinger) {
    credits["Singer"] = {
      name: firstSinger.name || "Unknown",
      image:
        getUploadUrlTrailer(firstSinger.file) ||
        getUploadUrlTrailer(firstSinger.image) ||
        getUploadUrlTrailer(firstSinger.photo) ||
        PLACEHOLDER_THUMB,
    };
  }

  return {
    id: movie._id || movie.id,
    title,
    thumbnail,
    videoUrl,
    duration,
    year,
    genre,
    description,
    credits,
  };
};
