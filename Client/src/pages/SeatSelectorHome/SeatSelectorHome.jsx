import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Film,
  RockingChair,
  Sofa,
  Ticket,
} from "lucide-react";
import { toast } from "react-toastify";
import "./SeatSelectorHome.css";
import {
  getAuthToken,
  normalizeSeatId,
  ROWS,
  seatId,
  slotToISO,
} from "../../utils/helper.jsx";
import api from "../../api/axios.js";
import API_ROUTES from "../../api/api_route.js";

const SeatSelectorHome = () => {
  const { id, slot } = useParams();
  const movieIdParam = id;
  const slotKey = slot ? decodeURIComponent(slot) : "";

  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAuthToken()),
  );
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAuthToken()));
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (
        ["token", "authToken", "accessToken", "jwt"].includes(e.key) ||
        e.key === null
      ) {
        setIsAuthenticated(Boolean(getAuthToken()));
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchMovie = async () => {
      setLoading(true);

      try {
        const response1 = await api.get(
          API_ROUTES.MOVIE.MOVIE_GET(movieIdParam),
        );

        // console.log("Fetch Movie API Response:", response1);

        if (!mounted) return;

        if (response1?.data?.success) {
          if (!response1.data || response1.data === false) {
            toast.error(response1?.data?.message || "Failed to load movie");
            setMovie(null);
          } else {
            const item =
              response1?.data?.item ||
              response1?.data?.data ||
              response1?.data?.movie ||
              response1.data;

            setMovie(item || null);
          }

          // toast.success(response1?.data?.message);
          // console.log("Fetch Movie Success:", response1?.data?.message);
        } else {
          toast.warn(response1?.data?.message);
          console.warn("Fetch Movie Data Error:", response1?.data?.message);
        }
      } catch (error1) {
        toast.error(error1?.response?.data?.message || error1?.message);
        console.error("Fetch Movie Movie Error:", error1);
        setMovie(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (movieIdParam) fetchMovie();
    else {
      setLoading(false);
      setMovie(null);
    }

    return () => {
      mounted = false;
    };
  }, [movieIdParam]);

  const slotObj = useMemo(() => {
    if (!movie || !slotKey) return null;

    const slots = Array.isArray(movie.slots)
      ? movie.slots
      : Array.isArray(movie.showtimes)
        ? movie.showtimes
        : [];

    if (!slots.length) return null;

    const sString = slots.find(
      (s) =>
        typeof s === "string" &&
        (s === slotKey || s === decodeURIComponent(slotKey)),
    );

    if (sString) return { time: sString, audi: "Audi 1", _iso: sString };

    for (const s of slots) {
      if (!s) continue;
      if (typeof s === "object") {
        const iso = slotToISO(s);
        if (!iso) continue;
        if (iso === slotKey || iso === decodeURIComponent(slotKey))
          return { ...s, _iso: iso };
      }
    }

    try {
      const providedIs = new Date(slotKey).getTime();
      if (!isNaN(providedIs)) {
        for (const s of slots) {
          const iso = slotToISO(s);
          if (!iso) continue;
          const ts = new Date(iso).getTime();
          if (!isNaN(ts) && ts === providedIs) return { ...s, _iso: iso };
        }
      }
    } catch (error) {}
    return null;
  }, [movie, slotKey]);

  const audiName = useMemo(() => {
    if (slotObj && slotObj?.auditorium && String(slotObj.auditorium).trim())
      return String(slotObj.auditorium).trim();

    if (slotObj && slotObj?.audi && String(slotObj.audi).trim())
      return String(slotObj.audi).trim();

    if (movie && movie?.auditorium && String(movie.auditorium).trim())
      return String(movie.auditorium).trim();

    if (movie && movie?.audi && String(movie?.audi).trim())
      return String(movie.audi).trim();

    if (movie && movie?.hall && String(movie?.hall).trim())
      return String(movie.hall).trim();

    return "Audi 1";
  }, [slotObj, movie]);

  useEffect(() => {
    if (!slotKey) {
      toast.error("Missing showtime. Select a time from the movie page");
      navigate(
        movie ? `/movies/${movie._id || movie.id || movieIdParam}` : "/movies",
      );
      return;
    }

    const isValidDate = !!slotKey && !isNaN(new Date(slotKey).getTime());
    if (!isValidDate && !slotObj) {
      toast.error(
        "Invalid or missing showtime. Please select a time from the movie page.",
      );
      navigate(
        movie ? `/movies/${movie._id || movie.id || movieIdParam}` : "/movies",
      );
    }
  }, [slotKey, movie, slotObj]);

  const mid = movie ? movie._id || movie.id || movieIdParam : movieIdParam;
  const storageKey = `bookings_${mid}_${slotKey}_${audiName}`;
  const legacyKey = `bookings_${mid}_${slotKey}`;

  useEffect(() => {
    let cancelled = false;

    const setBookedAndPrune = (arr) => {
      const set = new Set(arr);
      if (cancelled) return;
      setBooked((prev) => {
        const same =
          prev.size === set.size && [...prev].every((v) => set.has(v));
        if (same) return prev;
        setSelected((selPrev) => {
          const nextSel = new Set(selPrev);
          for (const s of set) nextSel.delete(s);
          return nextSel;
        });

        return set;
      });

      try {
        localStorage.setItem(storageKey, JSON.stringify([...set]));
      } catch (error) {}
    };

    const fetchOccupiedSeats = async () => {
      if (!movieIdParam || !slotKey) return;
      const showtimeQuery = slotObj && slotObj._iso ? slotObj._iso : slotKey;

      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response2 = await api.get(
          API_ROUTES.BOOKING.BOOKING_GET_OCCUPIED,
          {
            params: {
              movieId: movieIdParam,
              showtime: showtimeQuery,
              audi: audiName,
            },
            headers,
            timeout: 8000,
          },
        );

        // console.log("Fetch Occupied Seats API Response:", response2);

        if (response2?.data?.success) {
          const occupied = Array.isArray(response2?.data?.occupied)
            ? response2.data.occupied
            : [];

          const normalized = occupied.map(normalizeSeatId).filter(Boolean);

          setBookedAndPrune(normalized);

          // toast.success(response2?.data?.message);
          // console.log("Fetch Occupied Seats Success:", response2?.data?.message);
        } else {
          toast.warn(response2?.data?.message);
          console.warn(
            "Fetch Occupied Seats Data Error:",
            response2?.data?.message,
          );
        }

        return;
      } catch (error2) {
        toast.error(error2?.response?.data?.message || error2?.message);
        console.error("Fetch Occupied Seats Error:", error2);
      }
    };

    fetchOccupiedSeats();
    return () => {
      cancelled = true;
    };
  }, [movieIdParam, slotKey, audiName, slotObj]);

  useEffect(() => {
    if (!loading && !movie) {
      toast.error("Movie not found.");
      navigate("/movies");
    }
  }, [loading, movie, navigate]);

  const toggleSeat = (id) => {
    const nid = normalizeSeatId(id);
    if (booked.has(nid)) {
      toast.info(`Seat ${nid} already booked`);
      return;
    }

    setSelected((prev) => {
      const next = new Set(prev);
      next.has(nid) ? next.delete(nid) : next.add(nid);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const basePriceRupee =
    Number(movie?.seatPrices?.standard ?? movie?.price ?? 0) || 0;
  const standardPaise = Math.round(basePriceRupee * 100);

  const reclinerRupee =
    typeof movie?.seatPrices?.recliner !== "undefined" &&
    movie?.seatPrices?.recliner !== null
      ? Number(movie.seatPrices.recliner)
      : null;

  const reclinerPaise =
    reclinerRupee !== null
      ? Math.round(reclinerRupee * 100)
      : Math.round(standardPaise * 1.5);

  const confirmBooking = async () => {
    if (selected.size === 0) {
      toast.warn("Select at least one seat.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      toast.error("You must be logged in to book seats.");
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      setTimeout(() => navigate(`/login?redirect=${returnUrl}`), 4000);
      return;
    }

    const seatsArr = [...selected].sort();
    setBookingLoading(true);

    try {
      const payload = {
        movieId: movie?._id || movie?.id || movieIdParam,
        movieName: movie?.title || movie?.movieName || movie?.name || "",
        showtime: slotKey,
        auditorium: audiName,
        seats: seatsArr,
        paymentMethod: "card",
        currency: "LKR",
        email: "",
      };

      const response3 = await api.post(
        API_ROUTES.BOOKING.BOOKING_CREATE,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // console.log("Create Booking API Response:", response3);

      if (response3?.data?.success) {
        toast.success(response3?.data?.message);
        // console.log("Create Booking Success:", response3?.data?.message);

        if (response3?.data?.checkout?.url) {
          const newBooked = new Set([
            ...booked,
            ...seatsArr.map(normalizeSeatId),
          ]);

          try {
            localStorage.setItem(storageKey, JSON.stringify([...newBooked]));
          } catch (error) {}

          window.location.href = response3?.data?.checkout.url;
          return;
        }

        const newBooked = new Set([
          ...booked,
          ...seatsArr.map(normalizeSeatId),
        ]);

        setBooked(newBooked);
        setSelected(new Set());

        try {
          localStorage.setItem(storageKey, JSON.stringify([...newBooked]));
        } catch (error) {}

        toast.success(
          `${seatsArr.length} seat(s) reserved - procedd to payment`,
        );
        return;
      } else {
        toast.warn(response3?.data?.message);
        console.warn("Create Booking Data Error:", response3?.data?.message);
      }

      toast.error(
        (response3.data && response3.data.message) ||
          "Failed to create booking on server",
      );
    } catch (error3) {
      toast.error(error3?.response?.data?.message || error3?.message);
      console.error("Create Booking Error:", error3);

      if (error3?.response?.status === 401) {
        toast.error("Session ecpired - please log in again.");
        ["token", "authToken", "accessToken", "jwt"].forEach((k) =>
          localStorage.removeItem(k),
        );

        setIsAuthenticated(false);
        const returnUrl = encodeURIComponent(
          window.location.pathname + window.location.search,
        );

        setTimeout(() => navigate(`/login?redirect=${returnUrl}`), 400);
        return;
      }

      if (error3?.response?.status === 409) {
        const occupied = error3?.response?.data?.occupied || [];
        if (occupied.length > 0) {
          setBooked((prev) => {
            const next = new Set(prev);
            occupied.forEach((s) => next.add(normalizeSeatId(s)));

            try {
              localStorage.setItem(storageKey, JSON.stringify([...next]));
            } catch (error) {}
            return next;
          });

          setSelected((prev) => {
            const next = new Set(prev);
            occupied.forEach((s) => next.delete(normalizeSeatId(s)));
            return next;
          });

          toast.error(
            `Some seats just booked by others: ${occupied.join(",")}`,
          );
        } else {
          toast.error(
            error3?.response?.data?.message || "Some seats are already booked.",
          );
        }

        return;
      }

      toast.error(
        error3?.response?.data?.message || "Failed to create booking",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPaise = [...selected].reduce((sum, s) => {
    const rowLetter = s[0];
    const def = ROWS.find((r) => r.id === rowLetter);
    const seatPaise = def?.type === "recliner" ? reclinerPaise : standardPaise;
    return sum + (seatPaise || 0);
  }, 0);

  const total = (totalPaise / 100).toFixed(2);
  const selectedCount = selected.size;

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* -------- Header -------- */}
        <div className="seat-top-bar flex items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-all px-4 py-3 rounded-xl hover:bg-purple-900/20"
            >
              <ArrowLeft size={18} /> Back
            </button>
          </div>

          <div className="flex-1 text-center">
            <h1 className="movie-title text-4xl md:text-6xl py-1 font-bold tracking-wider mb-2 bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {movie?.title}
            </h1>

            <div className="text-sm text-gray-500 mt-1.5 flex items-center justify-center gap-2">
              {slotKey
                ? new Date(slotKey).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Showtime unavilable"}
            </div>
          </div>

          <div className="flex items-center justify-end min-w-30">
            <div className="inline-flex items-center gap-2 px-1.5 py-1.5 rounded-[10px] bg-linear-to-r from-[#111111] to-[#222222] text-purple-500 font-bold shadow-[0px_6px_18px_rgba(0,0,0,0.45)]">
              <Film size={14} /> <span>{audiName}</span>
            </div>
          </div>
        </div>

        {/* -------- Screen -------- */}
        <div className="mb-8">
          <div className="mx-auto bg-linear-to-b from-gray-800 to-gray-900 rounded-t-2xl shadow-2xl text-center p-6 relative curved-screen">
            <div className="text-lg font-semibold text-gray-300 tracking-widest">
              CURVED SCREEN
            </div>

            <div className="text-xs text-gray-200 mt-2">
              Please face the screen - enjoy the show
            </div>
          </div>
        </div>

        {/* -------- Main Content -------- */}
        <div className="bg-linear-to-br from-black/80 to-gray-900 rounded-3xl p-8 border border-purple-700/10 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <h2 className="section-title text-2xl bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent font-bold mb-2 flex items-center justify-center gap-2">
                Select Your Seats
              </h2>
              <div className="w-20 h-1 bg-linear-to-r from-purple-500 to-transparent mx-auto" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {ROWS.map((row) => (
              <div
                key={row.id}
                className="w-full max-w-4xl flex flex-col items-center"
              >
                <div className="w-full flex items-center justify-center mb-3">
                  <div className="w-12 mx-3 text-lg font-bold text-purple-400 text-center">
                    {row.id}
                  </div>

                  <div className="flex-1 flex justify-center">
                    <div className="seat-grid w-full max-w-180">
                      {Array.from({ length: row.count }).map((_, i) => {
                        const num = i + 1;

                        const id = seatId(row.id, num);
                        const nid = normalizeSeatId(id);

                        const isBooked = booked.has(nid);
                        const isSelected = selected.has(nid);

                        return (
                          <button
                            key={id}
                            onClick={() => toggleSeat(id)}
                            disabled={isBooked}
                            className={`seat-btn flex items-center justify-center text-sm font-semibold cursor-pointer transition-transform duration-200 transform hover:scale-105 
                              ${
                                isBooked
                                  ? "opacity-40 cursor-not-allowed bg-gray-800 text-gray-500"
                                  : isSelected
                                    ? row.type === "recliner"
                                      ? "bg-linear-to-br from-pink-500 to-pink-700 text-white shadow-2xl"
                                      : "bg-linear-to-br from-purple-500 to-purple-700 text-white shadow-2xl"
                                    : row.type === "recliner"
                                      ? "bg-pink-900 text-pink-200"
                                      : "bg-gray-800 text-gray-200"
                              }
                          `}
                            title={
                              isBooked
                                ? `Seat ${id} - Already Booked`
                                : `Seat ${id} (${row.type}) - LKR${row.type === "recliner" ? Math.round(basePriceRupee * 1.5) : basePriceRupee}`
                            }
                            aria-label={isSelected}
                          >
                            {row.type === "recliner" ? (
                              <div className="flex flex-col items-center justify-center">
                                <Sofa size={16} className="seat-icon" />
                                <div className="text-xs mt-0.5 font-bold seat-num">
                                  {num}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <RockingChair size={16} className="seat-icon" />
                                <div className="text-xs mt-0.5 font-bold seat-num">
                                  {num}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="w-20 px-3 text-sm font-semibold text-gray-400 capitalize text-center">
                    {row.type}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* -------- Booking Summary & Actions -------- */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-black/30 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Ticket size={18} /> Booking Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl">
                  <span className="text-gray-300">Selected Seats:</span>

                  <span className="font-bold text-purple-300 text-lg">
                    {selectedCount}
                  </span>
                </div>

                {selectedCount > 0 && (
                  <>
                    <div className="p-3 bg-black/30 cursor-pointer rounded-xl">
                      <div className="text-sm text-gray-400 mb-2">
                        Selected Seats:
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[...selected].sort().map((seat) => (
                          <span
                            key={seat}
                            className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-linear-to-r from-purple-900/20 to-transparent rounded-xl">
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-semibold">
                          Total Amount:
                        </span>

                        <span className="font-bold text-purple-400 text-2xl">
                          LKR{Math.round(total)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {selectedCount === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-lg mb-1">No seats selected</div>

                    <div className="text-sm">
                      Select seats from the grid to continue
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={clearSelection}
                    disabled={selectedCount === 0}
                    className="flex-1 px-4 py-3 rounded-full cursor-pointer bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>

                  <button
                    onClick={confirmBooking}
                    disabled={selectedCount === 0}
                    className="flex-1 px-4 py-3 rounded-full cursor-pointer bg-linear-to-r from-purple-600 to-purple-700 text-white font-bold hover:from-purple-700 hover:to-purple-800 transition-all transform  disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black/30 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard size={18} /> Pricing Info
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-black/40">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-300">Standard</div>

                    <div className="font-bold text-purple-400">
                      LKR {basePriceRupee}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-300">Recliner</div>

                    <div className="font-bold text-pink-400">
                      LKR {Math.round(basePriceRupee * 1.5)}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  All prices includes taxes. No hidden charges.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectorHome;
