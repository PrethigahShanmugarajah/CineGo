// CineGo / Client / src / components / Trailers / Trailers.jsx
import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  Play,
  X,
} from "lucide-react";
import "./Trailers.css";
import { toast } from "react-toastify";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import {
  mapMovieToTrailerItem,
  PLACEHOLDER_IMG,
  PLACEHOLDER_THUMB,
} from "../../utils/helper";
import { ClipLoader } from "react-spinners";

const Trailers = () => {
  const [featuredTrailer, setFeaturedTrailer] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef(null);
  const carouselRef = useRef(null);

  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    const pickArray = (json) =>
      (Array.isArray(json?.items) && json.items) ||
      (Array.isArray(json?.movies) && json.movies) ||
      (Array.isArray(json?.data) && json.data) ||
      (Array.isArray(json?.results) && json.results) ||
      [];

    async function loadLatestTrailers() {
      try {
        const response = await api.get(
          API_ROUTES.MOVIE.MOVIE_GET_LATEST_TRAILER,
          { signal: ac.signal },
        );

        console.log("Fetch Latest Trailer API Response:", response);

        const json = response.data;

        if (json?.success) {
          // toast.success(json?.message);
          console.log("Fetch Latest Trailer Success:", json?.message);

          const items = pickArray(json);
          const mapped = items.map(mapMovieToTrailerItem);

          console.log("Mapped Movies:", mapped);

          setTrailers(mapped);
          setFeaturedTrailer(mapped[0] || null);
        } else {
          toast.warn(json?.message);
          console.warn("Fetch Latest Trailer Data Error:", json?.message);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.error("Fetch Latest Trailer Error:", error);
        setError("Failed to load from server");
      } finally {
        setLoading(false);
      }
    }

    loadLatestTrailers();

    return () => ac.abort();
  }, []);

  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const selectTrailer = (trailer) => {
    setFeaturedTrailer(trailer);
    setIsPlaying(false);

    try {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    } catch (error) {}

    try {
      if (carouselRef.current) {
        const el = carouselRef.current.querySelector(
          `[data-id='${trailer.id}']`,
        );
        if (el) {
          const rect = el.getBoundingClientRect();
          const parentRect = carouselRef.current.getBoundingClientRect();

          const offset =
            rect.left - parentRect.left - parentRect.width / 2 + rect.width / 2;
          carouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
        }
      }
    } catch (error) {}
  };

  const togglePlay = () => {
    setIsPlaying((s) => !s);
  };

  const getEmbedBaseUrl = (videoUrl) => {
    if (!videoUrl) return "";
    try {
      const url = new URL(videoUrl);
      const host = url.hostname.replace("www.", "").toLowerCase();

      if (host.includes("youtube.com")) {
        const vid = url.searchParams.get("v");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
        if (url.pathname.includes("/embed"))
          return `https://www.youtube.com${url.pathname}`;
      }

      if (host === "youtu.be") {
        const vid = url.pathname.replace("/", "");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
      }

      if (host.includes("vimeo.com")) {
        const parts = url.pathname.split("/").filter(Boolean);
        const id = parts.pop();
        if (id) return `https://player.vimeo.com/video/${id}`;
      }

      return videoUrl;
    } catch (error) {
      return videoUrl || "";
    }
  };

  const buildFrameSrc = (videoUrl) => {
    const base = getEmbedBaseUrl(videoUrl);
    if (!base) return "";
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-300 text-gray-900">
        <div className="py-12 text-center text-gray-400 col-span-full rounded-lg flex items-center justify-center gap-3">
          <ClipLoader size={18} color="#A855F7" />
          <span className="text-sm animate-pulse">Loading Trailers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-300 text-gray-900">
        <div className="py-12 text-center text-red-400">{error}</div>
      </div>
    );
  }

  const dataToRender = trailers || [];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-300 text-black">
      <main className="relative z-10 pt-20 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row md:flex-row gap-8">
          {/* -------- Left Side -------- */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="bg-white font-[pacifico] rounded-xl shadow-lg p-5 md:p-6">
              <h2
                className="text-2xl font-semibold mb-4 flex items-center gap-2"
                style={{ fontFamily: "Monoton, cursive" }}
              >
                <Clapperboard className="text-purple-600" /> Latest Trailers
              </h2>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollLeft}
                    className="p-2 rounded-full bg-gray-100 hover:bg-purple-100 text-purple-600 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={scrollRight}
                    className="p-2 rounded-full bg-gray-100 hover:bg-purple-100 text-purple-600 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <span className="text-sm text-gray-500">
                  {dataToRender.length} trailers
                </span>
              </div>

              <div
                ref={carouselRef}
                className="flex overflow-x-auto scrollbar-hide space-x-3 pb-3 -mx-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {dataToRender.map((trailer) => (
                  <div
                    key={trailer.id}
                    data-id={trailer.id}
                    className={`flex-none rounded-lg overflow-hidden relative cursor-pointer transition-all transform ${
                      featuredTrailer.id === trailer.id
                        ? "ring-2 ring-purple-600 shadow-md scale-100"
                        : "hover:scale-[1.02] hover:ring-1 hover:ring-purple-400"
                    }`}
                    style={{
                      width: "220px",
                      height: "124px",
                      minWidth: "220px",
                    }}
                    onClick={() => selectTrailer(trailer)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "")
                        selectTrailer(trailer);
                    }}
                    aria-pressed={featuredTrailer.id === trailer.id}
                  >
                    <img
                      src={trailer.thumbnail || PLACEHOLDER_IMG}
                      alt={trailer.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">
                        {trailer.title}
                      </h3>

                      <p className="text-xs text-white">{trailer.genre}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="font-bold text-lg">Now Trending</h3>
                {dataToRender.slice(0, 3).map((trailer) => (
                  <div
                    onClick={() => selectTrailer(trailer)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "")
                        selectTrailer(trailer);
                    }}
                    key={trailer.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <div className="w-14 h-14 rounded-md overflow-hidden shrink-0">
                      <img
                        src={trailer.thumbnail || PLACEHOLDER_IMG}
                        alt={trailer.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">{trailer.title}</h4>

                      <p className="text-xs text-gray-500">{trailer.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -------- Right Side -------- */}
          <div className="w-full md:w-1/2 lg:w-3/5">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                {isPlaying ? (
                  <div className="relative aspect-video ">
                    <iframe
                      className="w-full h-full"
                      src={buildFrameSrc(featuredTrailer.videoUrl)}
                      title={featuredTrailer.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      ref={videoRef}
                    />

                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        title="Close"
                        onClick={() => setIsPlaying(false)}
                        className="p-1 rounded-full text-white bg-transparent"
                      >
                        <X size={28} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video group bg-gray-900">
                    <img
                      src={featuredTrailer.thumbnail || PLACEHOLDER_IMG}
                      alt={featuredTrailer.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={togglePlay}
                        className="bg-purple-600 hover:bg-purple-700 cursor-pointer rounded-full p-4 md:p-5 transition-all transform"
                      >
                        <Play size={32} fill="white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold font-dancing">
                    {featuredTrailer.title}
                  </h2>

                  <div className="flex items-center space-x-4 text-sm text-black">
                    <span className="flex items-center">
                      <Clock size={16} className="mr-1 text-purple-600" />
                      {featuredTrailer.duration}
                    </span>

                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1 text-purple-600" />
                      {featuredTrailer.year}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {featuredTrailer.genre.split(",").map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-gray-500">
                  {featuredTrailer.description}
                </p>

                <div className="mt-6 font-[pacifico]">
                  <h3 className="text-2xl font-bold mb-4">Credits</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-start">
                  {featuredTrailer.credits &&
                    Object.entries(featuredTrailer.credits).map(
                      ([role, person]) => (
                        <div
                          key={role}
                          className="flex flex-col items-center text-center"
                        >
                          <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm">
                            <img
                              src={person.image || PLACEHOLDER_THUMB}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="mt-2 text-lg font-medium">
                            {person.name}
                          </div>

                          <div className="text-sm text-gray-500 capitalize">
                            {role}
                          </div>
                        </div>
                      ),
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trailers;
