import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
import "./MovieDetailPage.css";
import {
  extractYouTubeId,
  FallbackAvatar,
  formatDateKey,
  formatTimeInTZ,
  getAuthToken,
  getEmbedUrl,
  getImageUrl,
  slotToISO,
  TOTAL_SEATS,
} from "../../utils/helper.jsx";
import api from "../../api/axios.js";
import API_ROUTES from "../../api/api_route.js";
import { ClipLoader } from "react-spinners";

const MovieDetailPage = () => {
  const { id: movieIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedTrailerId, setSelectedTrailerId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedMap, setBookedMap] = useState({});

  useEffect(() => {
    let mounted = true;

    (async function fetchMovie() {
      setLoading(true);

      if (!movieIdParam) {
        setMovie(null);
        setLoading(false);
        return;
      }

      try {
        const response1 = await api.get(
          API_ROUTES.MOVIE.MOVIE_GET(movieIdParam),
        );

        // console.log("Fetch Movie API Response:", response1);

        if (!mounted) return;

        if (response1?.data?.success) {
          const item =
            response1.data.item ||
            response1.data.data ||
            response1.data.movie ||
            response1.data;

          if (item) {
            if (
              !item.producer &&
              Array.isArray(item.producers) &&
              item.producers.length
            ) {
              item.producer = item.producers[0];
            }

            if (
              item.poster &&
              typeof item.poster === "string" &&
              !item.poster.startsWith("http")
            ) {
              item.poster = getImageUrl(item.poster);
            }

            if (
              item.thumbnail &&
              typeof item.thumbnail === "string" &&
              !item.thumbnail.startsWith("http")
            ) {
              item.thumbnail = getImageUrl(item.thumbnail);
            }

            ["cast", "directors", "producers"].forEach((k) => {
              if (Array.isArray(item[k])) {
                item[k] = item[k].map((p) => {
                  if (!p) return p;

                  const preview =
                    p.preview ||
                    (p.file ? getImageUrl(p.file) : null) ||
                    (p.image ? getImageUrl(p.image) : null);

                  return { ...p, preview, img: p.img || preview };
                });
              }
            });
          }

          setMovie(item || null);

          // toast.success(response1?.data?.message);
          // console.log("Fetch Movie Success:", response1?.data?.message);
        } else {
          toast.warn(response1?.data?.message);
          console.warn("Fetch Movie Data Error:", response1?.data?.message);
          setMovie(null);
        }
      } catch (error1) {
        if (!mounted) return;

        toast.error(error1?.response?.data?.message || error1?.message);
        console.error("Booking Movies Error:", error1);
        setMovie(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [movieIdParam]);

  useEffect(() => {
    if (!movie && !loading) toast.error("Movie not found.");
  }, [movie, loading]);

  const showtimeDays = useMemo(() => {
    if (!movie) return [];
    const TZ = "Asia/Colombo";
    const slotsByDate = {};
    const rawSlots =
      (Array.isArray(movie.slots) && movie.slots.length && movie.slots) ||
      (Array.isArray(movie.showtimes) &&
        movie.showtimes.length &&
        movie.showtimes) ||
      (Array.isArray(movie._normalizedSlots) &&
        movie._normalizedSlots.length &&
        movie._normalizedSlots) ||
      [];

    rawSlots.forEach((raw) => {
      try {
        const iso = slotToISO(raw);
        if (!iso) return;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return;
        const dateKey = formatDateKey(d, TZ);
        if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
        const audi = (raw && raw.audi) || (raw && raw.auditorium) || "Audi";
        slotsByDate[dateKey].push({ iso, audi });
      } catch (error) {}
    });
    return Object.keys(slotsByDate)
      .sort()
      .map((key) => {
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
        const showtimes = (slotsByDate[key] || [])
          .map(({ iso, audi }) => {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return null;
            return {
              time: formatTimeInTZ(d, TZ),
              datetime: iso,
              timestamp: d.getTime(),
              audi,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.timestamp - b.timestamp);
        const dateStr = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          timeZone: TZ,
        }).format(asDate);

        return { date: key, dayName, shortDay, dateStr, showtimes };
      });
  }, [movie]);

  useEffect(() => {
    if (!showtimeDays.length) {
      setSelectedDay(0);
      setSelectedTime(null);
      return;
    }
    setSelectedDay((cur) => (cur >= 0 && cur < showtimeDays.length ? cur : 0));
    setSelectedTime(null);
  }, [showtimeDays]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!movie) {
        setBookedMap({});
        return;
      }

      const movieId = movie._id || movie.id || movieIdParam;

      if (!movieId) {
        setBookedMap({});
        return;
      }

      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response2 = await api.get(API_ROUTES.BOOKING.BOOKING_GET, {
          params: { movieId, limit: 1000 },
          headers,
          timeout: 15000,
        });

        // console.log("Fetch Movie API Response:", response2);

        if (response2?.data?.success) {
          let items = [];

          if (Array.isArray(response2?.data?.items))
            items = response2.data.items;
          else if (Array.isArray(response2?.data)) items = response2.data;
          else if (Array.isArray(response2?.data?.bookings))
            items = response2.data.bookings;

          const map = {};

          const blockingStatus = new Set([
            "pending",
            "paid",
            "active",
            "confirmed",
            "upcoming",
          ]);

          for (const b of items) {
            if (!b) continue;

            const status = String(b.status || "").toLowerCase();
            if (!blockingStatus.has(status)) continue;

            const show = b.showtime || b.slot || b.datetime || b.time || null;
            if (!show) continue;

            const audi = b.auditorium || b.audi || "Audi 1";

            const seatsArr = Array.isArray(b.seats) ? b.seats : [];
            const seatCount = seatsArr.length;

            const key = `${show}_${audi}`;
            map[key] = (map[key] || 0) + seatCount;
          }

          if (mounted) setBookedMap(map);

          // toast.success(response2?.data?.message);
          // console.log("Fetch Movie Success:", response2?.data?.message);
        } else {
          toast.warn(response2?.data?.message);
          console.warn("Fetch Movie Data Error:", response2?.data?.message);
        }
      } catch (error2) {
        toast.error(error2?.response?.data?.message || error2?.message);
        console.error("Booking Movies Error:", error2);
        if (mounted) setBookedMap({});
      }
    })();

    return () => {
      mounted = false;
    };
  }, [movie, movieIdParam]);

  const openTrailer = (movieObj) => {
    const trailerCandidate =
      movieObj?.trailerUrl ||
      movieObj?.trailer ||
      movieObj?.trailerId ||
      movieObj?.latestTrailer?.videoId ||
      movieObj?.latestTrailer?.url ||
      null;

    const id = extractYouTubeId(trailerCandidate || "");

    if (!id) {
      toast.info("Trailer not available for this movie.");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white col-span-full text-center  py-8 border border-purple-800 rounded-lg gap-3">
        <ClipLoader size={18} color="#A855F7" />
        <span className="text-sm font-medium animate-pulse">Loading...</span>
      </div>
    );
  }

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

  const buildSeatSelectorPath = (movieIdlocal, datetime) => {
    const key = encodeURIComponent(datetime);
    const usesSingular = (location.pathname || "")
      .toLowerCase()
      .includes("/movie/");

    const mid = movie._id || movie.id || movieIdlocal || movieIdParam;

    return usesSingular
      ? `/movie/${mid}/seat-selector/${key}`
      : `/movies/${mid}/seat-selector/${key}`;
  };

  const handleTimeSelect = (datetime) => {
    setSelectedTime(datetime);
    navigate(
      buildSeatSelectorPath(movie._id || movie.id || movieIdParam, datetime),
    );
  };

  const handleBookNow = () => {
    if (selectedTime)
      navigate(
        buildSeatSelectorPath(
          movie._id || movie.id || movieIdParam,
          selectedTime,
        ),
      );
    else toast.error("Please select a show time first.");
  };

  const getBookedCountFor = (datetime) => {
    try {
      const key = `${datetime}_${audi}`;
      if (bookedMap && typeof bookedMap[key] === "number")
        return bookedMap[key];

      const mid = movie._id || movie.id || movieIdParam;
      const keyWithAudi = `bookings_${mid}_${datetime}_${audi}`;
      const rawWith = localStorage.getItem(keyWithAudi);

      if (rawWith) {
        const arr = JSON.parse(rawWith);
        if (Array.isArray(arr)) return arr.length;
      }

      const legacyKey = `bookings_${mid}_${datetime}`;
      const rawLegacy = localStorage.getItem(legacyKey);

      if (rawLegacy) {
        const arrLegacy = JSON.parse(rawLegacy);
        if (Array.isArray(arrLegacy)) return arrLegacy.length;
      }

      return 0;
    } catch {
      return 0;
    }
  };

  const posterSrc =
    movie.img ||
    movie.thumbnail ||
    movie.poster ||
    movie.posterUrl ||
    (movie.thumbnail &&
    typeof movie.thumbnail === "string" &&
    movie.thumbnail.startsWith("http")
      ? movie.thumbnail
      : `${import.meta.env.VITE_BASEURL}/uploads/placeholder.png`);

  const categoryList = Array.isArray(movie.categories)
    ? movie.categories
    : Array.isArray(movie.genres)
      ? movie.genres
      : movie.genre
        ? [movie.genre]
        : [];

  const producer =
    (Array.isArray(movie.producers) && movie.producers[0]) ||
    movie.producer ||
    null;

  const producerImg = producer
    ? producer.img ||
      producer.preview ||
      (producer.file ? getImageUrl(producer.file) : null)
    : null;

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white py-8 px-4">
      {showTrailer && selectedTrailerId && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={closeTrailer}
              className="absolute right-0 sm:-top-10 -top-6 sm:-right-4 text-white hover:text-purple-400 z-10"
            >
              <X size={36} />
            </button>

            <div className="w-full aspect-video rounded-xl overflow-hidden">
              <iframe
                key={selectedTrailerId}
                width="100%"
                height="100%"
                src={getEmbedUrl(selectedTrailerId)}
                title={`${selectedMovie?.title || "trailer"} Trailer`}
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
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-purple-900/20"
          >
            <ArrowLeft size={18} />
            <span className="text-sm sm:text-base">Back</span>
          </Link>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="movie-title text-3xl sm:text-5xl md:text-5xl lg:text-7xl py-1 font-bold tracking-wider mb-4 bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {movie?.title || movie?.movieName || movie?.name}
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-base sm:text-lg text-gray-300">
            <span className="flex items-center gap-2">
              <Star className={`h-4 w-4 text-yellow-400`} />
              {movie.rating}/10
            </span>

            <span className="flex items-center gap-2">
              <Clock className={`h-4 w-4 text-purple-400`} />
              {movie.duration}
            </span>

            <span className="px-3 py-1 bg-purple-900/40 rounded-full text-purple-300 text-sm border border-purple-700/30">
              {categoryList.join(", ")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <div className="lg:col-span-1 order-1 md:order-1">
            <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-700/20 shadow-2xl">
              <div className="movie-poster-container relative overflow-hidden rounded-xl mx-auto w-full">
                <img
                  src={posterSrc}
                  alt={movie.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png";
                  }}
                />
              </div>

              <button
                onClick={() => openTrailer(movie)}
                className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-linear-to-r from-purple-600 to-purple-700 text-white font-semibold text-base sm:text-lg transition-all shadow-lg"
              >
                <Play size={18} /> <span>Watch Trailer</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 order-2 md:order-2">
            <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl mb-6">
              <h3 className="text-2xl sm:text-4xl font-bold mb-6 text-purple-300 text-center flex items-center justify-center gap-2 section-title">
                <Calendar className="text-2xl sm:text-4xl font-bold text-purple-300 text-center flex items-center justify-center gap-2" />
                <span>Showtimes</span>
              </h3>

              <div className="flex overflow-x-auto gap-2 mb-4 pb-2 sm:mb-8 sm:pb-0 scrollbar-hide">
                {showtimeDays.map((day, index) => (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDay(index);
                      setSelectedTime(null);
                    }}
                    className={`shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                      selectedDay === index
                        ? "bg-purple-600 text-white shadow-lg transform scale-105"
                        : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/80"
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{day.shortDay}</div>

                    <div className="text-sm sm:text-base">{day.dateStr}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {showtimeDays[selectedDay]?.showtimes.map((showtime, index) => {
                  const bookedCount = getBookedCountFor(showtime?.datetime);
                  const isSoldOut = bookedCount >= TOTAL_SEATS;

                  return (
                    <button
                      key={index}
                      onClick={() => handleTimeSelect(showtime.datetime)}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-semibold transition-all duration-300 border flex items-center justify-center gap-2 text-center ${
                        selectedTime === showtime.datetime
                          ? "bg-purple-600 text-white border-purple-500/50 transform scale-105"
                          : "bg-gray-800/40 text-gray-200 border-gray-700/50 hover:bg-purple-600 hover:text-white hover:border-purple-500/50"
                      }`}
                      // title={
                      //   isSoldOut
                      //     ? "All seats booked for this showtime"
                      //     : `Seats available: ${Math.max(0,TOTAL_SEATS - bookedCount)}`
                      // }
                      aria-disabled={isSoldOut}
                    >
                      <span>{showtime?.time}</span>
                      {isSoldOut && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-700/90 text-white font-bold">
                          Sold Out
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedTime && (
                <div className="mt-4 sm:mt-6 text-center">
                  <button
                    onClick={handleBookNow}
                    className="px-6 py-2.5 rounded-full bg-linear-to-r from-purple-600 to-purple-700 text-white font-bold text-base sm:text-lg shadow-2xl hover:from-purple-700 hover:to-purple-800 transition-transform transform hover:scale-105"
                  >
                    Proceed to Seat Selection
                  </button>
                </div>
              )}
            </div>

            <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl">
              <h3 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-300 text-center flex items-center justify-center gap-2 section-title">
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
                            className="w-20 h-20 rounded-full object-cover mx-auto border border-purple-950/30 group-hover:border-purple-400 transition-colors cursor-pointer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx9Q6Yd8-kM9jL67sPbeE3Jty14HkjckIPSA&s";
                            }}
                          />
                        ) : (
                          <FallbackAvatar className="w-20 h-20 mx-auto" />
                        )}
                      </div>
                      <div className="font-semibold text-base sm:text-lg">
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

        <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-purple-300 text-center section-title">
            Story
          </h2>

          <p className="text-gray-300 leading-relaxed text-base sm:text-lg text-center max-w-4xl mx-auto">
            {movie?.story || movie?.synopsis || "Story not available."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-2xl p-4 sm:p-8 border border-purple-700/20 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="h-5 w-5 text-purple-400" />
              <h3 className="text-xl sm:text-3xl font-bold text-purple-300 section-title">
                Director
              </h3>
            </div>

            <div className="flex flex-col items-center">
              {(() => {
                const directors = Array.isArray(movie.directors)
                  ? movie.directors
                  : Array.isArray(movie.director)
                    ? movie.director
                    : movie.director
                      ? [movie.director]
                      : [];

                return (
                  <div className="flex gap-4 sm:gap-6 items-start justify-center">
                    {directors.length ? (
                      directors.slice(0, 2).map((d, i) => (
                        <div key={i} className="flex flex-col items-center">
                          {d?.img || d?.preview ? (
                            <img
                              src={d.img}
                              alt={d.name || `Director ${i + 1}`}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-purple-950/30 hover:border-purple-400 mb-3 sm:mb-4 cursor-pointer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png";
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 flex items-center justify-center text-xl text-gray-300 mb-3 sm:mb-4">
                              ?
                            </div>
                          )}
                          <div className="font-semibold text-base sm:text-xl">
                            {d?.name || "N/A"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 flex items-center justify-center text-xl text-gray-300 mb-3 sm:mb-4">
                          ?
                        </div>
                        <div className="font-semibold text-base sm:text-xl">
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="h-5 w-5 text-purple-400" />
              <h3 className="text-xl sm:text-3xl font-bold text-purple-300 section-title">
                Producer
              </h3>
            </div>

            <div className="flex flex-col items-center">
              {producer?.img || producer?.preview ? (
                <img
                  src={producerImg}
                  alt={movie.producer.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-purple-950/30 hover:border-purple-400 mb-3 sm:mb-4 cursor-pointer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx9Q6Yd8-kM9jL67sPbeE3Jty14HkjckIPSA&s";
                  }}
                />
              ) : (
                <FallbackAvatar className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4" />
              )}

              <div className="font-semibold text-base sm:text-xl">
                {producer?.name ?? "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
