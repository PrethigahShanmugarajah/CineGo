// CineGo / Client / src / pages / MovieDetailPageHome / MovieDetailPageHome.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import movies from "../../assets/dummymoviedata";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import "./MovieDetailPageHome.css";
import {
  extractYouTubeId,
  FallbackAvatar,
  formatDateKey,
  formatTimeInTZ,
  getEmbedUrl,
  TOTAL_SEATS,
} from "../../utils/helper";

const MovieDetailPageHome = () => {
  const { id } = useParams();
  const movieId = Number(id);
  const movie = useMemo(() => movies.find((m) => m.id === movieId), [movieId]);

  const navigate = useNavigate();
  const location = useLocation();

  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedTrailerId, setSelectedTrailerId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    if (!movie) {
      toast.error("Movie not found");
    }
  }, [movie]);

  const showtimeDays = useMemo(() => {
    if (!movie) return [];

    const TZ = "Asia/Colombo";
    const slotsByDate = {};

    (movie.slots || []).forEach((raw) => {
      let iso = null;
      let audi = "Audi 1";

      if (!raw) return;

      if (typeof raw === "string") {
        iso = raw;
        audi = "Audi 1";
      } else if (typeof raw === "object" && raw.time) {
        iso = raw.time;
        audi = raw.audi ?? "Audi";
      } else {
        return;
      }

      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return;

      const dateKey = formatDateKey(d, TZ);
      if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
      slotsByDate[dateKey].push({ iso, audi });
    });

    const dateKeys = Object.keys(slotsByDate).sort();

    const days = dateKeys.map((key) => {
      const [yy, mm, dd] = key.split("-").map(Number);
      const asDate = new Date(Date.UTC(yy, mm - 1, dd));
      const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: TZ,
      }).format(asDate);
      const shortDay = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: TZ,
      }).format(asDate);
      const dateStr = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "numeric",
        timeZone: TZ,
      }).format(asDate);

      const rawSlots = slotsByDate[key] || [];

      const showtimes = rawSlots
        .map(({ iso, audi }) => {
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return null;
          const timeLabel = formatTimeInTZ(iso, TZ);
          return {
            time: timeLabel,
            datetime: iso,
            timestamp: d.getTime(),
            audi,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ time, datetime, audi }) => ({ time, datetime, audi }));

      return {
        date: key,
        dayName,
        shortDay,
        dateStr,
        showtimes,
      };
    });

    return days;
  }, [movie]);

  useEffect(() => {
    if (showtimeDays.length === 0) {
      setSelectedDay(0);
      setSelectedTime(null);
      return;
    }
    setSelectedDay((cur) => {
      const newIndex = cur >= 0 && cur < showtimeDays.length ? cur : 0;
      return newIndex;
    });
    setSelectedTime(null);
  }, [showtimeDays]);

  const openTrailer = (movieObj) => {
    const idFromField = movieObj?.trailerId ?? null;
    const id = idFromField || extractYouTubeId(movieObj?.trailer || " ");
    if (!id) {
      toast.info("Trailer not available for this movie");
      return;
    }
    setSelectedMovie(movieObj);
    setSelectedTrailerId(id);
    setShowTrailer(true);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setSelectedTrailerId(null);
    setSelectedMovie(null);
  };

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl">Movie not found.</h2>
          <Link
            to="/movies"
            className="mt-4 inline-block text-purple-400 underline"
          >
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const buildSelectorPath = (movieIdParams, datetime) => {
    const key = encodeURIComponent(datetime);
    const pathLower = (location.pathname || "").toLowerCase();
    const usesSingular = pathLower.includes("/movie/");

    if (usesSingular) {
      return `/movie/${movieIdParams}/seat-selector/${key}`;
    }
    return `/movies/${movieIdParams}/seat-selector/${key}`;
  };

  const handleTimeSelect = (datetime) => {
    setSelectedTime(datetime);
    const path = buildSelectorPath(movie.id, datetime);
    navigate(path);
  };

  const handleBookNow = () => {
    if (selectedTime) {
      const path = buildSelectorPath(movie.id, selectedTime);
      navigate(path);
    } else {
      toast.error("Please select a showtime first");
    }
  };

  const getBookedCountFor = (datetime, audi = "Audi 1") => {
    try {
      const keyWithAudi = `bookings_${movie.id}_${datetime}_${audi}`;
      const rawWith = localStorage.getItem(keyWithAudi);

      if (rawWith) {
        const arr = JSON.parse(rawWith);
        if (Array.isArray(arr)) return arr.length;
      }

      const legacyKey = `bookings_${movie.id}_${datetime}`;
      const rawLegacy = localStorage.getItem(legacyKey);
      if (rawLegacy) {
        const arrLegacy = JSON.parse(rawLegacy);
        if (Array.isArray(arrLegacy)) return arrLegacy.length;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  };

  const firstShowtime = useMemo(() => {
    if (!showtimeDays.length) return null;
    for (const day of showtimeDays) {
      if (day.showtimes && day.showtimes.length)
        return day.showtimes[0].datetime;
    }
    return null;
  }, [showtimeDays]);

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white py-8 px-4">
      {/* -------- Trailer Modal -------- */}
      {showTrailer && selectedTrailerId && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={closeTrailer}
              className="absolute right-0 sm:-top-10 -top-6 sm:-right-4 text-white hover:text-purple-400 z-10"
              aria-label="Close trailer"
            >
              <X size={36} />
            </button>

            <div className="w-full aspect-video rounded-xl overflow-hidden">
              <iframe
                key={selectedTrailerId}
                width="100%"
                height="100%"
                src={getEmbedUrl(selectedTrailerId)}
                title={`${selectedMovie?.title || "Trailer"} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* -------- Header -------- */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-purple-900/20"
          >
            <ArrowLeft size={18} />
            <span className="text-sm sm:text-base">Back</span>
          </Link>
        </div>

        {/* -------- Title -------- */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="movie-title text-2xl sm:text-4xl md:text-5xl lg:text-7xl py-1 font-bold tracking-wider mb-4 bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {movie.title}
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-lg text-gray-300">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              {movie.rating}/10
            </span>

            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              {movie.duration}
            </span>

            <span className="px-3 py-1 bg-purple-900/40 rounded-full text-purple-300 text-xs sm:text-sm border border-purple-700/30">
              {movie.genre}
            </span>
          </div>
        </div>

        {/* -------- Layout -------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* -------- Poster -------- */}
          <div className="lg:col-span-1 order-1 md:order-1">
            <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-6 border border-purple-700/20 shadow-2xl">
              <div className="movie-poster relative overflow-hidden rounded-xl mx-auto w-full">
                <img
                  src={movie.img}
                  alt={movie.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png";
                  }}
                />
              </div>

              <button
                onClick={() => openTrailer(movie)}
                className="w-full mt-5 sm:mt-6 flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-linear-to-r from-purple-600 to-purple-700 text-white font-semibold text-sm sm:text-base transition-all shadow-lg"
                aria-label="Watch trailer"
              >
                <Play size={18} /> <span>Watch Trailer</span>
              </button>
            </div>
          </div>

          {/* -------- Showtimes + Cast -------- */}
          <div className="lg:col-span-2 order-2 md:order-2">
            <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl mb-6">
              <h3 className="cinzel-title text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-purple-300 text-center flex items-center justify-center gap-2">
                <Calendar className="h-6 w-6" />
                <span>Showtimes</span>
              </h3>

              {/* -------- Day Selection -------- */}
              <div className="flex overflow-x-auto gap-2 mb-4 pb-2 sm:mb-6 sm:pb-0 scrollbar-hide">
                {showtimeDays.length ? (
                  showtimeDays.map((day, index) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDay(index);
                        setSelectedTime(null);
                      }}
                      className={`shrink-0 px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm 
                        ${
                          selectedDay === index
                            ? "bg-purple-600 text-white shadow-lg transform scale-105"
                            : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/80"
                        }`}
                      aria-pressed={selectedDay === index}
                      aria-label={`Select ${day.dayName} ${day.dateStr}`}
                    >
                      <div className="text-xs">
                        {day.shortDay}{" "}
                        <div className="text-sm sm:text-base">
                          {day.dateStr}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm px-2">
                    No showtime dates available
                  </div>
                )}
              </div>

              {/* -------- Showtime grid -------- */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {showtimeDays[selectedDay]?.showtimes &&
                showtimeDays[selectedDay].showtimes.length ? (
                  showtimeDays[selectedDay].showtimes.map((showtime, index) => {
                    const bookedCount = getBookedCountFor(
                      showtime.datetime,
                      showtime.audi,
                    );
                    const isSoldOut = bookedCount >= TOTAL_SEATS;
                    return (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(showtime.datetime)}
                        className={`px-2 sm:px-3 py-2 sm:py-3 rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 border flex items-center justify-center gap-2 text-center 
                          ${
                            selectedTime === showtime.datetime
                              ? "bg-purple-600 text-white border-purple-500/50 transform scale-105"
                              : "bg-gray-800/40 text-gray-200 border-gray-700/50 hover:bg-purple-600 hover:text-white hover:border-purple-500/50"
                          }`}
                        title={
                          isSoldOut
                            ? "All seats booked for this showtime"
                            : `Seats available:${Math.max(0, TOTAL_SEATS - bookedCount)}`
                        }
                        aria-label={isSoldOut}
                      >
                        <span>{showtime.time}</span>
                        {isSoldOut && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-700/90 text-white font-bold">
                            Sold Out
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-400 py-6">
                    No showtimes available for the selected date.
                  </div>
                )}
              </div>

              {selectedTime && (
                <div className="mt-4 sm:mt-6 text-center">
                  <button
                    onClick={handleBookNow}
                    className="px-5 py-2.5 rounded-full bg-linear-to-r from-purple-600 to-purple-700 text-white font-bold text-sm sm:text-base shadow-2xl hover:from-purple-700 hover:to-purple-800 transition-transform transform hover:scale-105"
                    aria-label="Proceed to seat selection"
                  >
                    Proceed to Seat Selection
                  </button>
                </div>
              )}
            </div>

            {/* -------- Cast -------- */}
            <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl">
              <h3 className="cinzel-title text-lg sm:text-2xl font-bold mb-4 text-purple-300 text-center flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                <span>Cast</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {movie.cast && movie.cast.length ? (
                  movie.cast.map((c, idx) => (
                    <div key={idx} className="text-center group">
                      <div className="relative mx-auto mb-3">
                        {c.img ? (
                          <img
                            src={c.img}
                            alt={c.name}
                            loading="lazy"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto border-2 border-purple-600/30 group-hover:border-purple-400 transition-colors"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx9Q6Yd8-kM9jL67sPbeE3Jty14HkjckIPSA&s";
                            }}
                          />
                        ) : (
                          <FallbackAvatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                        )}
                      </div>

                      <div className="font-semibold text-sm sm:text-base">
                        {c.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        {c.role}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 col-span-full text-center py-8">
                    No cast data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* -------- Story -------- */}
        <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl mb-8">
          <h2 className="cinzel-title text-lg sm:text-2xl md:text-3xl font-bold mb-4 text-purple-300 text-center">
            Story
          </h2>

          <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg text-center max-w-4xl mx-auto">
            {movie.synopsis}
          </p>
        </div>

        {/* -------- Director & Producer -------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl text-center">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-300 flex items-center justify-center gap-3 mb-4">
              <User className="h-5 w-5 text-purple-400" />
              <h3 className="cinzel-title">Director</h3>
            </div>

            <div className="flex flex-col items-center">
              {(() => {
                const directors = Array.isArray(movie.director)
                  ? movie.director
                  : movie.director
                    ? [movie.director]
                    : [];

                return (
                  <div className="flex gap-4 sm:gap-6 items-start justify-center">
                    {directors.length ? (
                      directors.slice(0, 2).map((d, i) => (
                        <div key={i} className="flex flex-col items-center">
                          {d?.img ? (
                            <img
                              src={d.img}
                              alt={d.name || `Director ${i + 1}`}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-purple-600/30 mb-3 sm:mb-4"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx9Q6Yd8-kM9jL67sPbeE3Jty14HkjckIPSA&s";
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 flex items-center justify-center text-xl text-gray-300 mb-3 sm:mb-4">
                              ?
                            </div>
                          )}
                          <div className="font-semibold text-sm sm:text-base">
                            {d.name ?? "N/A"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 flex items-center justify-center text-xl text-gray-300 mb-3 sm:mb-4">
                          ?
                        </div>

                        <div className="font-semibold text-sm sm:text-base">
                          N/A
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl text-center">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-300 flex items-center justify-center gap-3 mb-4">
              <User className="h-5 w-5 text-purple-400" />
              <h3 className="cinzel-title">Producer</h3>
            </div>

            <div className="flex flex-col items-center">
              {movie.producer?.img ? (
                <img
                  src={movie.producer.img}
                  alt={movie.producer.name}
                  loading="lazy"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-purple-600/30 mb-3 sm:mb-4"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx9Q6Yd8-kM9jL67sPbeE3Jty14HkjckIPSA&s";
                  }}
                />
              ) : (
                <FallbackAvatar className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4" />
              )}

              <div className="font-semibold text-sm sm:text-base">
                {movie.producer?.name ?? "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPageHome;
