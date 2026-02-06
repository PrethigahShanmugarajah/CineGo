// CineGo / Admin / src / components / ListMoviesPage / ListMoviesPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  Film,
  Play,
  PlayIcon,
  Search,
  Star,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { ClipLoader } from "react-spinners";

import "./ListMoviesPage.css";

function getImageUrl(maybe) {
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
  const cleaned = String(maybe).replace(/^uploads\//, "");
  return `${import.meta.env.VITE_BASEURL}/uploads/${cleaned}`;
}

const ListMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const searchRef = useRef();

  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      fetchMovies();
    }, 3000);

    return () => clearTimeout(searchRef.current);
  }, [filterType, search]);

  useEffect(() => {
    fetchMovies();
  }, []);

  async function fetchMovies() {
    try {
      setLoading(true);
      setError(null);
      const params = {};

      if (filterType && filterType !== "all") {
        params.type = filterType;
      }

      if (filterType === "latestTrailers") {
        params.latestTrailers = true;
      }

      if (search && search.trim()) params.search = search.trim();

      console.log("API params:", params);

      const response = await api.get(API_ROUTES.MOVIE.MOVIE_GET, {
        params,
      });

      console.log("List Movie API Response:", response);

      let items = [];

      if (response?.data?.success) {
        console.log("List Movie Success:", response?.data?.message);

        items = response.data.items || [];
      } else if (Array.isArray(response?.data)) {
        items = response.data;
      } else {
        toast.warn(response?.data?.message);
        console.log("List Movie Data Error:", response?.data?.message);

        items = [];
      }

      const normalized = items.map(normalizeMovie);
      setMovies(normalized);
      console.log("Movies:", normalized);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      setError(error?.response?.data?.message || error?.message);
      console.log("List Movie Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function normalizeMovie(item) {
    const obj = { ...item };
    obj.poster = getImageUrl(item.poster) || (item.poster ? item.poster : null);

    const normalizTopPeople = (arr = []) =>
      (arr || []).map((p) => ({
        ...(p || {}),
        preview:
          p?.preview ||
          getImageUrl(p?.file) ||
          p?.file ||
          p?.image ||
          p?.url ||
          null,
      }));

    obj.cast = normalizTopPeople(item.cast);
    obj.directors = normalizTopPeople(item.directors);
    obj.producers = normalizTopPeople(item.producers);

    if (
      item.latestTrailer &&
      (item.type === "latestTrailers" ||
        item.latestTrailer.title ||
        item.latestTrailer.thumbnail ||
        item.latestTrailer.videoId)
    ) {
      const lt = item.latestTrailer || {};

      obj.title = lt.title || item.title || item.movieName || null;

      obj.geners = lt.generes || lt.geners || item.geners || item.generes || [];
      obj.year = lt.year || item.year || null;
      obj.rating = lt.rating ?? item.rating ?? null;
      obj.duration = lt.duration || item.duration || null;
      obj.description =
        lt.description || item.description || item.story || null;

      const normalizeLatestPeople = (arr = []) =>
        (arr || []).map((p) => ({
          ...(p || [{}]),
          preview: p?.preview || getImageUrl(p?.file) || p?.file || null,
        }));

      obj.directors = normalizeLatestPeople(
        lt.directors || item.latestTrailer?.directors || item.directors || [],
      );

      obj.producers = normalizeLatestPeople(
        lt.producers || item.latestTrailer?.producers || item.producers || [],
      );

      obj.singers = normalizeLatestPeople(
        lt.singers || item.latestTrailer?.singers || item.singers || [],
      );
    } else {
      obj.thumbnail = getImageUrl(item.thumbnail) || obj.poster || null;
    }

    obj.type =
      obj.type || (obj.title && !obj.movieName ? "latestTrailers" : "normal");

    obj.displayTitle =
      obj.movieName || obj.title || obj.movieName || "Untitled";

    return obj;
  }

  const types = useMemo(
    () => [
      { key: "all", label: "All", icon: Film },
      { key: "normal", label: "Normal", icon: Ticket },
      { key: "featured", label: "Featured", icon: Star },
      { key: "releaseSoon", label: "Coming Soon", icon: Calendar },
      { key: "latestTrailers", label: "Trailers", icon: PlayIcon },
    ],
    [],
  );

  const filtered = useMemo(() => {
    return (movies || []).filter((item) => item.type !== "cinenews");
  }, [movies]);

  async function handleDelete(id, action) {
    if (action === "open") {
      const item = movies.find((m) => m._id === id || m.id === id);
      if (!item) return;

      setDeleteTarget(item);
      setDeleteOpen(true);
      return;
    }

    if (action === "close") {
      if (deleteLoading) return;
      setDeleteOpen(false);
      setDeleteTarget(null);
      return;
    }

    if (action === "confirm") {
      if (!deleteTarget || deleteLoading) return;

      try {
        setDeleteLoading(true);

        const targetId = deleteTarget._id || deleteTarget.id;

        const response = await api.delete(
          API_ROUTES.MOVIE.MOVIE_DELETE(targetId),
        );

        console.log("Delete Movie API Response:", response);

        if (response?.data?.success) {
          toast.success(response?.data?.message);
          console.log("Delete Movie Success:", response?.data?.message);

          if (selected && (selected._id || selected.id) === targetId)
            setSelected(null);

          setMovies((prev) => prev.filter((m) => (m._id || m.id) !== targetId));

          setDeleteOpen(false);
          setDeleteTarget(null);
        } else {
          toast.warn(response?.data?.message);
          console.log("Delete Movie Data Error:", response?.data?.message);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.log("Delete Movie Error:", error);
      } finally {
        setDeleteLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-6 lg:p-6 bg-linear-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* -------- Header -------- */}
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
            <div className="text-left">
              <h1 className="text-2xl lg:text-3xl font-bold">Movies</h1>
              <div className="text-sm text-gray-400 mt-1">
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <ClipLoader size={18} color="#A855F7" />
                    <span className="text-sm animate-pulse">Loading...</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">
                    {filtered.length} items
                  </span>
                )}
              </div>
            </div>

            {/* -------- Search -------- */}
            <div className="w-full flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
              <div className="relative w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-135 mx-auto lg:mx-0">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search movies, stories, trailers..."
                  className="w-full px-12 py-3 rounded-2xl text-sm sm:text-base md:text-lg bg-gray-800/50 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                />

                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* -------- FilterTabs -------- */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {types.map((t) => {
              const IconComponent = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    console.log(
                      `Filter clicked → key: ${t.key}, label: ${t.label}`,
                    );
                    setFilterType(t.key);
                  }}
                  className={`filter-btn flex items-center gap-2 px-4 py-2 sm:py-3 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer ${
                    filterType === t.key
                      ? "bg-linear-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25"
                      : "gradient-border text-gray-300 hover:bg-purple-900/20 hover:text-white hover:border-purple-500/40"
                  }`}
                >
                  <IconComponent size={16} /> {t.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* -------- Main Grid -------- */}
        <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {error && (
                <div className="col-span-full p-6 text-center text-purple-300 rounded-2xl gradient-border">
                  <div className="font-semibold">Error</div>
                  <div className="text-sm mt-2">{error}</div>

                  <div className="mt-1">
                    <button
                      onClick={fetchMovies}
                      className="px-4 py-2 bg-purple-700 rounded-lg"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!error && filtered.length === 0 && !loading && (
                <div className="col-span-full p-8 text-center gradient-border rounded-2xl">
                  <div className="text-gray-400 text-lg">No items found.</div>
                  <div className="text-gray-500 text-sm mt-2">
                    Try adjusting your search or filters
                  </div>
                </div>
              )}

              {filtered.map((item) => (
                <Card
                  key={item._id || item.id || item.title || item.displayTitle}
                  item={item}
                  onOpen={() => setSelected(item)}
                  onDelete={() => handleDelete(item._id || item.id, "open")}
                />
              ))}

              {loading && (
                <div className="col-span-full p-6 text-center gradient-border rounded-2xl">
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <ClipLoader size={18} color="#A855F7" />
                    <span className="text-sm font-medium animate-pulse">
                      Loading movies...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="md:col-span-1 lg:col-span-2">
            <div className="md:sticky md:top-6 lg:top-6 gradient-border rounded-2xl p-5 md:p-6 backdrop-blur-sm max-h-[auto] md:max-h-[75vh] lg:h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Details
                </h2>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>

              {selected ? (
                <DetailView item={selected} onClose={() => setSelected(null)} />
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 md:py-16">
                  <div className="flex items-center justify-center mb-3 w-full">
                    <div className="p-6 bg-gray-900/30 rounded-3xl border border-gray-700 backdrop-blur-sm">
                      <Film size={60} className="text-purple-600" />
                    </div>
                  </div>

                  <div className="text-gray-400 text-base mb-2">
                    Click 'View Deatils' on a card
                  </div>

                  <div className="text-gray-400 text-base mb-2">
                    Details will appear here after you click
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>

      {deleteOpen && (
        <DeletePopup
          loading={deleteLoading}
          onClose={() => handleDelete(null, "close")}
          onDelete={() => handleDelete(null, "confirm")}
        />
      )}
    </div>
  );
};

function Card({ item, onOpen, onDelete }) {
  const getTypeColor = (type) => {
    const colors = {
      featured: "from-fuchsia-500 to-purple-600",
      normal: "from-amber-500 to-red-600",
      releaseSoon: "from-pink-500 to-violet-600",
      latestTrailers: "from-green-500 to-sky-600",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  const posterOrThumb =
    item.poster ||
    item.thumbnail ||
    item.image ||
    item.latestTrailer?.thumbnail ||
    null;

  return (
    <div
      className="card-hover bg-gray-800/40 rounded-2xl overflow-hidden gradient-border cursor-pointer group relative"
      onClick={onOpen}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onDelete === "function") onDelete();
        }}
        title="Delete"
        aria-label={`Delete ${item.movieName || item.title}`}
        className="absolute top-3 right-3 z-10 p-2 cursor-pointer rounded-full bg-red-700/90 hover:bg-red-800 text-white transition-colors"
      >
        <Trash2 size={14} />
      </button>

      <div className="relative">
        <img
          src={posterOrThumb}
          alt={item.movieName || item.title || item.displayTitle}
          className="w-full h-44 sm:h-52 md:h-48 lg:h-52 object-contain transition-transform duration-500"
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white truncate group-hover:text-purple-300 transition-colors mb-1">
              {item.movieName || item.title || item.displayTitle}
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {(item.categories || item.geners || []).map((cat, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-700/50 rounded-lg text-xs text-gray-300 border border-gray-600"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 ml-3">
            {item.type !== "releaseSoon" && (
              <>
                {item.rating && (
                  <div className="flex items-center gap-1.5 bg-teal-500/20 px-3 py-1 rounded-full text-sm">
                    <Star
                      className="text-teal-400"
                      size={14}
                      fill="currentColor"
                    />

                    <span className="text-teal-400 text-sm font-bold">
                      {item.rating}
                    </span>
                  </div>
                )}

                {displayDuration(item) && (
                  <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full text-sm">
                    <Clock className="text-amber-400" size={14} />
                    <span className="text-amber-400 text-sm">
                      {displayDuration(item)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 min-h-14">
          {(item.story || item.description || item.excerpt || "").slice(0, 150)}
          {(item.story || item.description || item.excerpt || "").length >
            150 && "..."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="flex items-center gap-2 px-4 md:px-2 md:text-xs py-2 bg-linear-to-r from-purple-600 to-purple-700 rounded-xl text-white text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 cursor-pointer"
            >
              <Play size={16} />
              View Details
            </button>

            {item.trailerUrl && item.type !== "releaseSoon" && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-3 py-2 gradient-border rounded-xl text-gray-300 text-sm hover:text-white hover:border-purple-500/60 transition-all duration-300 cursor-pointer"
              >
                <PlayIcon className="w-4 h-4 text-purple-500" />
                Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function displayDuration(item) {
  if (!item || !item.duration) return "";

  if (typeof item.duration === "object") {
    const h = Number(item.duration.hours || 0);
    const m = Number(item.duration.minutes || 0);
    if (!h && !m) return "";
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  const totalMins = Number(item.duration);
  if (!Number.isFinite(totalMins) || totalMins <= 0) return "";

  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

function formatSlot(s) {
  try {
    const d = s.date ? new Date(s.date + "T00:00:00") : null;
    const dayName = d
      ? d.toLocaleDateString(undefined, { weekday: "short" })
      : "";

    const dateStr = d ? d.toLocaleDateString() : s.date || "";
    const time = s.time || "";
    const ampm = s.ampm || "";
    return `${dayName} ${dateStr} + ${time} ${ampm}`.trim();
  } catch (error) {
    return `${s.date || ""} ${s.time || ""} ${s.ampm || ""}`;
  }
}

function PersonGrid({ list = [], roleLabel = "" }) {
  if (!list || list.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
        <div className="font-bold text-white text-lg">{roleLabel}</div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {list.map((p, i) => (
          <div key={i} className="shrink-0 text-center group cursor-pointer">
            <div className="relative">
              <img
                src={p.preview || p.file || p.image || p.url || ""}
                alt={p.name || `${roleLabel}-${i}`}
                className="w-20 h-20 object-cover rounded-2xl mb-3 mx-auto border-2 border-gray-600 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-105"
              />
            </div>

            <div className="font-semibold text-sm text-white truncate max-w-25 mx-auto">
              {p.name || "-"}
            </div>

            {p.role && p.role !== roleLabel && (
              <div className="text-gray-400 text-xs mt-1 px-2 py-1 bg-gray-700/50 rounded-full">
                {p.role}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailView({ item, onClose }) {
  const getTypeGradient = (type) => {
    const gradients = {
      normal: "from-amber-500 to-red-600",
      featured: "from-fuchsia-500 to-purple-600",
      releaseSoon: "from-pink-500 to-violet-600",
      latestTrailers: "from-green-500 to-sky-600",
    };
    return gradients[type] || "from-gray-500 to-gray-600";
  };

  const displayAuditorium =
    item?.auditorium || item?.auditorium === "" ? item.auditorium : "Audi 1";

  return (
    <div className="space-y-6">
      {/* -------- Header -------- */}
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-4 h-4 rounded-full bg-linear-to-r ${getTypeGradient(item.type)}`}
            ></div>
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              {item.type === "featured" && "Featured Movie"}
              {item.type === "normal" && "Now Showing"}
              {item.type === "releaseSoon" && "Coming Soon"}
              {item.type === "latestTrailers" && "Latest Trailer"}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
            {item.movieName || item.title || item.displayTitle}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 p-2.5 gradient-border rounded-xl text-gray-400 hover:text-white hover:border-purple-500/60 transition-all duration-300 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {item.type === "latestTrailers" && (
          <>
            {item.thumbnail && (
              <div className="rounded-2xl overflow-hidden gradient-border">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-56 object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 gradient-border rounded-2xl">
              {item.geners && item.geners.length > 0 && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Genres
                  </div>

                  <div className="text-white font-medium">
                    {(item.geners || []).join(",")}
                  </div>
                </div>
              )}

              {item.year && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Year
                  </div>

                  <div className="text-white font-medium">{item.year}</div>
                </div>
              )}

              {item.duration && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Duration
                  </div>
                  <div className="text-white font-medium">
                    {displayDuration(item)}
                  </div>
                </div>
              )}

              {item.rating && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Rating
                  </div>
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <Star size={16} fill="currentColor" />
                    {item.rating}/10
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-gray-400 text-sm uppercase font-semibold">
                  Auditorium
                </div>
                <div className="text-white font-medium">
                  {displayAuditorium}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-gray-400 text-sm uppercase font-semibold">
                Description
              </div>
              <div className="text-gray-300 leading-relaxed text-base">
                {item.description}
              </div>
            </div>

            {item.trailerUrl && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-linear-to-r from-purple-600 to-purple-700 rounded-2xl text-white font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] shadow-lg"
              >
                <Play size={20} />
                Watch Trailer Now
              </a>
            )}

            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
            <PersonGrid list={item.singers} roleLabel="Singers" />
          </>
        )}

        {(item.type === "normal" || item.type === "featured") && (
          <>
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-2xl overflow-hidden gradient-border">
                <img
                  src={item.poster}
                  alt={item.movieName}
                  className="w-full h-72 object-contain"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 sm:p-5 gradient-border rounded-2xl">
                <div className="space-y-1">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Rating
                  </div>
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <Star size={18} fill="currentColor" />
                    {item.rating ?? "-"}/10
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Duration
                  </div>
                  <div className="text-white font-medium text-lg">
                    {displayDuration(item)}
                  </div>
                </div>

                {item.seatPrices && (
                  <>
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm uppercase font-semibold">
                        Standard
                      </div>
                      <div className="text-pink-400 font-bold text-lg">
                        LKR {item.seatPrices.standard}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm uppercase font-semibold">
                        Recliner
                      </div>
                      <div className="text-pink-400 font-bold text-lg">
                        LKR {item.seatPrices.recliner}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {item.trailerUrl && (
                <a
                  href={item.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 gradient-border rounded-xl text-gray-300 text-sm hover:text-white hover:border-purple-500/60 transition-all duration-300 cursor-pointer justify-center"
                >
                  <Play size={18} />
                  Watch official Trailer
                </a>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                <div className="text-gray-400 text-sm uppercase font-semibold">
                  Story
                </div>
              </div>

              <div className="text-gray-300 leading-relaxed text-base">
                {item.story}
              </div>
            </div>

            {(item.slots || []).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-purple-400" />
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Showtimes
                  </div>
                </div>

                <div className="space-y-3">
                  {(item.slots || []).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 gradient-border rounded-2xl hover:border-purple-500/60 transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-white font-medium">
                        {formatSlot(s)}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-pink-400 text-xs font-semibold"></div>
                        <span className="text-pink-400 text-xs font-semibold">
                          Available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PersonGrid list={item.cast} roleLabel="Cast" />
            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
          </>
        )}

        {item.type === "releaseSoon" && (
          <div className="text-center space-y-6 py-8">
            <div className="rounded-2xl overflow-hidden gradient-border mx-auto max-w-sm transform transition-transform duration-500">
              <img
                src={item.poster}
                alt={item.movieName}
                className="w-full h-72 object-contain"
              />
            </div>

            <div className="text-gray-400 text-lg font-semibold">
              Coming Soon
            </div>

            <div className="flex justify-center gap-3">
              {(item.categories || []).map((cat, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gray-700/50 rounded-full text-sm text-gray-300 border border-gray-600 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="text-gray-500 text-sm mt-4">
              Stay tuned for more updates!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeletePopup({ onClose, onDelete, loading }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-96 relative shadow-lg text-white">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="text-center mt-4">
          <h4 className="mb-2 text-lg font-semibold text-purple-600">
            Are you sure?
          </h4>
          <p className="text-gray-200 text-sm">
            Do you really want to delete this movie? <br />
            This action cannot be undone.
          </p>

          <div className="flex justify-center mt-5 gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={onDelete}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer flex items-center justify-center min-w-22.5"
            >
              {loading ? <ClipLoader size={18} color="#FFFFFF" /> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListMoviesPage;
