import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { toast } from "react-toastify";
import {
  Calendar,
  Film,
  PlayIcon,
  Search,
  Star,
  Theater,
  Ticket,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import "./ListMovies.css";
import DeletePopup from "./components/DeletePopup";
import { getImageUrl } from "../../utils/helper";
import Card from "./components/Card";
import DetailView from "./components/DetailView";

const ListMovies = () => {
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

      // console.log("API params:", params);

      const response = await api.get(API_ROUTES.MOVIE.MOVIES_GET, {
        params,
      });

      // console.log("List Movie API Response:", response);

      let items = [];

      if (response?.data?.success) {
        // toast.success(response?.data?.message);
        // console.log("List Movie Success:", response?.data?.message);

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
      // console.log("Movies:", normalized);
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

        // console.log("Delete Movie API Response:", response);

        if (response?.data?.success) {
          toast.success(response?.data?.message);
          // console.log("Delete Movie Success:", response?.data?.message);

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
                    // console.log(
                    //   `Filter clicked → key: ${t.key}, label: ${t.label}`,
                    // );
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
                      <Theater size={60} className="text-purple-600" />
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

export default ListMovies;
