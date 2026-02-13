import { useEffect, useMemo, useState } from "react";
import { fmtLKR, formatSlot, getStoredToken } from "../../utils/helper";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { toast } from "react-toastify";
import { Clock, Theater, Ticket, X } from "lucide-react";
import { ClipLoader } from "react-spinners";
import "./Bookings.css";

const Bookings = () => {
  const [selectedMovie, setSelectedMovie] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      setLoading(true);
      try {
        const token = getStoredToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const params = { paymentStatus: "paid", limit: 1000 };

        let response;

        try {
          response = await api.get(API_ROUTES.BOOKING.BOOKING_GET, {
            headers,
            params,
          });

          // console.log("Fetch Users' Bookings API Response:", response);

          if (response?.data?.success) {
            // toast.success(response?.data?.message);
            // console.log("Fetch Users' Bookings Success:",response?.data?.message);
          } else {
            toast.warn(response?.data?.message);
            console.log(
              "Fetch Users' Bookings Data Error:",
              response?.data?.message,
            );
          }
        } catch (error) {
          response = await api.get(API_ROUTES.BOOKING.BOOKING_LIST, {
            headers,
            params,
          });

          // console.log("Fetch Bookings API Response:", response);

          if (response?.data?.success) {
            // toast.success(response?.data?.message);
            // console.log("Fetch Bookings Success:", response?.data?.message);
          } else {
            toast.warn(response?.data?.message);
            console.log("Fetch Bookings Data Error:", response?.data?.message);
          }
        }

        const data = response?.data;
        let items = [];
        if (!data) items = [];
        else if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.bookings)) items = data.bookings;
        else items = [];

        const mapped = items.map((b) => {
          const id = b._id || b.id || b.bookingId || "";
          const movie =
            (b.movie && (b.movie.title || b.movie.movieName)) ||
            b.movieName ||
            (typeof b.movie === "string" ? b.movie : "");

          const rawSlot = b.showtime || b.slot || b.time || b.date;
          // const slot = rawSlot ? new Date(rawSlot) : null;
          const slot =
            rawSlot && !Number.isNaN(new Date(rawSlot).getTime())
              ? new Date(rawSlot)
              : null;

          const basePrice =
            Number(
              b.basePrice || b.base_price || (b.movie && b.movie.price) || 0,
            ) || 0;

          let seats = [];

          if (Array.isArray(b.seats)) {
            seats = b.seats
              .map((s) =>
                typeof s == "string" ? s : (s && (s.seatId || s.id)) || "",
              )
              .filter(Boolean);
          } else if (Array.isArray(b.seatIds)) {
            seats = b.seatIds.map(String).filter(Boolean);
          }

          const customer =
            b.customer ||
            b.customerName ||
            (b.user && (b.user.name || b.user.fullName)) ||
            (b.raw && b.raw.customer) ||
            "";

          let amountRupees = 0;
          if (b.amountPaise !== undefined && b.amountPaise !== null)
            amountRupees = Number(b.amountPaise) / 100;
          else if (typeof b.amount === "number") amountRupees = b.amount;
          else if (
            b.raw &&
            b.raw.amountPaise !== undefined &&
            b.raw.amountPaise !== null
          )
            amountRupees = Number(b.raw.amountPaise) / 100;

          const status = (b.status || (b.raw && b.raw.status) || "")
            .toString()
            .toLowerCase();

          const paymentStatus = (
            b.paymentStatus ||
            (b.raw && b.raw.paymentStatus) ||
            ""
          )
            .toString()
            .toLowerCase();

          let auditorium =
            b.auditorium ||
            b.audi ||
            b.audiName ||
            b.hall ||
            (b.raw && (b.raw.auditorium || b.raw.audi || b.raw.hall)) ||
            "";

          auditorium = auditorium ? String(auditorium) : "";

          return {
            id,
            movie,
            slot,
            basePrice,
            seats,
            customer,
            raw: b,
            amount: amountRupees,
            status,
            paymentStatus,
            auditorium,
          };
        });

        const paidOnly = mapped.filter(
          (m) =>
            m.paymentStatus === "paid" ||
            m.status === "paid" ||
            m.status === "confirmed",
        );

        if (!cancelled) setBookings(paidOnly);
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.log("Fetch Bookings Error:", error);

        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const movies = useMemo(() => {
    const set = new Set(bookings.map((b) => b.movie));
    return Array.from(set);
  }, [bookings]);

  const bookingsToShow = useMemo(() => {
    const filtered = selectedMovie
      ? bookings.filter((b) => b.movie === selectedMovie)
      : bookings;
    return filtered;
  }, [selectedMovie, bookings]);

  const clearFilter = () => {
    setSelectedMovie("");
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 sm:p-10 bookings-font">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-3 w-full lg:w-auto"
          >
            <label className="sr-only" htmlFor="movie">
              Movie
            </label>

            <select
              id="movie"
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-purple-800 text-sm outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">All Movies</option>
              {movies.map((m) => (
                <option value={m} key={m}>
                  {m}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilter}
              title="Clear Movie"
              className="px-3 py-2 rounded-lg bg-purple-700 text-white text-sm hover:brightness-95"
            >
              <X className="w-4 h-4 inline-block" />
            </button>
          </form>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && (
            <div className="col-span-full text-center text-gray-400 py-8 rounded-lg flex items-center justify-center gap-3">
              <ClipLoader size={18} color="#A855F7" />
              <span className="text-sm animate-pulse">Loading bookings...</span>
            </div>
          )}

          {!loading && bookingsToShow.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-8 rounded-lg">
              No paid bookings.
            </div>
          )}

          {bookingsToShow.map((b) => {
            const amount = b.amount || 0;
            const audiDisplay =
              b.auditorium && b.auditorium.trim() ? b.auditorium : "Audi 1";

            return (
              <article
                key={b.id}
                className="bg-linear-to-r from-gray-900 to-black border border-purple-800 rounded-xl p-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-purple-800 flex items-center justify-center text-white">
                        <Theater className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="text-lg font-bold text-purple-300">
                          {b.movie}
                        </div>

                        <div className="text-xs text-gray-400">
                          Booking ID:{" "}
                          <span className="font-mono ml-1 text-xs text-gray-200">
                            {b.id}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                          Booked By
                        </div>

                        <div className="text-sm font-semibold text-gray-200">
                          {b.customer || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right -ml-2">
                      <div className="text-xs text-gray-400">Seats</div>
                      <div className="font-semibold text-gray-200">
                        {b.seats.length}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />

                      <div>
                        {b.slot ? formatSlot(b.slot) : "Time Unavailable"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-purple-400" />
                      <div className="text-sm text-gray-300">
                        <span className="text-xs text-gray-400 mr-2">
                          Auditorium:
                        </span>

                        <span className="font-semibold text-gray-200">
                          {audiDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-purple-400" />
                      <div>{b.seats.join(",")}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Amount</div>
                    <div className="text-lg font-bold text-purple-300">
                      {fmtLKR(amount)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Bookings;
