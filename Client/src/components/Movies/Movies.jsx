import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tickets } from "lucide-react";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { getUploadUrl, PLACEHOLDER_IMG } from "../../utils/helper.jsx";
import "./Movies.css";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ac = new AbortController();
    setLoading(true);
    setError(null);

    async function loadFeaturedMovies() {
      try {
        const response = await api.get(API_ROUTES.MOVIE.MOVIES_GET_FEATURED, {
          signal: ac.signal,
        });

        // console.log("Featured Featured Movies API Response:", response);

        if (response?.data?.success) {
          // toast.success(response?.data?.message);
          // console.log("Fetch Featured Movies Success:",response?.data?.message);

          const json = response.data;

          const items = Array.isArray(json?.items)
            ? json.items
            : Array.isArray(json?.movies)
              ? json.movies
              : Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json?.results)
                  ? json.results
                  : [];

          const featuredOnly = items.filter(
            (it) =>
              it?.featured === true ||
              it?.isFeatured === true ||
              String(it?.type)?.toLowerCase() === "featured",
          );

          setMovies((featuredOnly.length ? featuredOnly : items).slice(0, 6));
        } else {
          toast.warn(response?.data?.message);
          console.warn(
            "Fetch Featured Movies Data Error:",
            response?.data?.message,
          );
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.error("Fetch Featured Movies Error:", error);

        if (
          error.name === "AbortError" ||
          error.name === "CanceledError" ||
          error.code === "ERR_CANCELED"
        )
          return;

        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedMovies();

    return () => ac.abort();
  }, []);

  const visibleMovies = movies.slice(0, 6);

  return (
    <section className="px-4 py-8 sm:py-12 max-w-6xl mx-auto">
      <h2 className="featured-title text-3xl sm:text-4xl md:text-5xl text-center mb-8">
        Featured Movies
      </h2>

      {loading ? (
        <div className="col-span-full text-center text-gray-400 py-8 rounded-lg flex items-center justify-center gap-3">
          <ClipLoader size={18} color="#A855F7" />
          <span className="text-sm animate-pulse">Loading movies...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 py-12 text-center">{error}</div>
      ) : movies.length === 0 ? (
        <div className="text-gray-500 py-12 text-center">
          No featured movies found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
          {movies.map((m) => {
            const rawImg =
              m.poster || m.latestTrailer?.thumbnail || m.thumbnail || null;
            const imgSrc = getUploadUrl(rawImg) || PLACEHOLDER_IMG;
            const title = m.movieName || m.title || "Untitled";

            const category =
              (Array.isArray(m.categories) && m.categories[0]) ||
              m.category ||
              "General";
            const movieId = m._id || m.id || title;

            return (
              <article
                key={movieId}
                className="flex flex-col items-center group"
              >
                <Link
                  to={`/movie/${movieId}`}
                  className="flex flex-col items-center group"
                >
                  <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy"
                    className="w-full rounded-2xl object-cover h-70 sm:h-56 md:h-64 lg:h-56 xl:h-70"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMG;
                    }}
                  />
                </Link>

                <div className="mt-3 text-center w-full px-1">
                  <div className="flex items-center justify-center gap-2">
                    <Tickets className="h-4 w-4 text-purple-600" />
                    <span
                      id={`movie-title-${movieId}`}
                      className="featured-title  text-base sm:text-lg font-medium truncate"
                    >
                      {title}
                    </span>
                  </div>

                  <div className="mt-1 font-[pacifico]">
                    <span className="text-xs sm:text-sm text-gray-500 capitalize">
                      {category}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Movies;
