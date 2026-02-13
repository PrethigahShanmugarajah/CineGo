import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  categoriesList,
  COLLAPSE_COUNT,
  mapBackendMovie,
} from "../../utils/helper";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const Movie = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;

    const pickArray = (json) =>
      (Array.isArray(json?.items) && json.items) ||
      (Array.isArray(json?.movies) && json.movies) ||
      (Array.isArray(json?.data) && json.data) ||
      (Array.isArray(json?.results) && json.results) ||
      [];

    async function loadMovies() {
      setLoading(true);
      setError(null);

      try {
        const response1 = await api.get(API_ROUTES.MOVIE.MOVIES_GET_NORMAL, {
          signal: ac.signal,
        });

        console.log("Fecth Normal Movie API Response:", response1);

        const json1 = response1.data;

        if (json1?.success) {
          // toast.success(json1?.message);
          // console.log("Fecth Normal Movie Success:", json1?.message);

          const items = pickArray(json1);
          const mapped = items.map(mapBackendMovie);

          if (mounted) setMovies(mapped);
        } else {
          toast.warn(json1?.message);
          console.warn("Fecth Normal Movie Data Error:", json1?.message);
        }
      } catch (error1) {
        if (
          error1?.name === "AbortError" ||
          error1?.name === "CanceledError" ||
          error1?.code === "ERR_CANCELED"
        )
          return;

        toast.error(error1?.response?.data?.message || error1?.message);
        console.error("Fetch Normal Movie Error:", error1);

        try {
          const response2 = await api.get(API_ROUTES.MOVIE.MOVIES_GET, {
            signal: ac.signal,
          });

          const json2 = response2.data;

          if (json2?.success) {
            // toast.success(json2?.message);
            // console.log("Fecth Movie Success:", json2?.message);

            const items = pickArray(json2);
            const mapped = items.map(mapBackendMovie);

            if (mounted) setMovies(mapped);
          } else {
            toast.warn(json2?.message);
            console.warn("Fecth Movie Data Error:", json2?.message);
          }
        } catch (error2) {
          if (mounted) setError("Unable to load movies.");
          toast.error(error2?.response?.data?.message || error2?.message);
          console.error("Fetch Movie Error:", error2);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMovies();

    return () => {
      mounted = false;
      ac.abort();
    };
  }, []);

  const filteredMovies = useMemo(() => {
    if (activeCategory === "all") return movies;
    return movies.filter(
      (m) =>
        String(m.category || "").toLowerCase() ===
        String(activeCategory || "").toLowerCase(),
    );
  }, [movies, activeCategory]);

  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  const visibleMovies = showAll
    ? filteredMovies
    : filteredMovies.slice(0, COLLAPSE_COUNT);

  return (
    <div className="min-h-screen pt-20 bg-linear-to-b from-gray-900 to-black text-white">
      <section className="pt-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categoriesList.map((category) => (
              <button
                key={category.id}
                className={`px-6 py-3 rounded-full cursor-pointer transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category?.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4 pb-20">
        <div className="container mx-auto">
          {loading ? (
            <div className="py-12 text-center col-span-full  text-gray-400  rounded-lg flex items-center justify-center gap-3">
              <ClipLoader size={18} color="#A855F7" />
              <span className="text-sm animate-pulse">Loading movies...</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {visibleMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    state={movie}
                    className="group relative cursor-pointer"
                  >
                    <div className="overflow-hidden rounded-lg aspect-2/3">
                      <img
                        src={movie?.image}
                        alt={movie?.title}
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                    </div>

                    <div className="mt-3 font-[pacifico]">
                      <h3 className="font-medium text-center truncate">
                        {movie?.title}
                      </h3>

                      <div className="flex justify-center mt-1">
                        <span className="text-xs text-gray-400 capitalize">
                          {movie?.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredMovies.length === 0 && (
                  <div className="col-span-full text-center text-gray-400 py-12">
                    No movies found in this category.
                  </div>
                )}
              </div>
            </>
          )}

          {filteredMovies.length > COLLAPSE_COUNT && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="px-6 py-3 cursor-pointer rounded-full text-white border border-white/10 bg-linear-to-b from-purple-500 to-purple-700 transition"
                type="button"
              >
                {showAll
                  ? "Show Less"
                  : `Show More (${
                      filteredMovies.length - COLLAPSE_COUNT
                    } more)`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Movie;
