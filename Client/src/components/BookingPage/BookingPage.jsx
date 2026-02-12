// CineGo / Client / src / components / BookingPage / BookingPage.jsx
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import {
  formatDurationBooking,
  formatTime,
  getStoredToken,
} from "../../utils/helper";
import { ClipLoader } from "react-spinners";
import { ChevronDown, Clock, MapPin, QrCode, Theater, X } from "lucide-react";
import { toast } from "react-toastify";

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [qrs, setQrs] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [scannedDetails, setScannedDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [colCount, setColCount] = useState(3);

  const navigate = useNavigate();

  function computeTotals(booking) {
    if (booking.amountPaise !== undefined && booking.amountPaise !== null) {
      const amt = Number(booking.amountPaise) / 100;
      return {
        subtotal: amt,
        total: amt,
        seatCount: (booking.seats || []).length || 0,
      };
    }

    if (
      booking.raw &&
      booking.raw.amountPaise !== undefined &&
      booking.raw.amountPaise !== null
    ) {
      const amt = Number(booking.raw.amountPaise) / 100;
      return {
        subtotal: amt,
        total: amt,
        seatCount: (booking.seats || []).length || 0,
      };
    }

    if (typeof booking.amount === "number" && booking.amount > 0) {
      return {
        subtotal: booking.amount,
        total: booking.amount,
        seatCount: (booking.seats || []).length || 0,
      };
    }

    if (
      booking.raw &&
      typeof booking.raw.amount === "number" &&
      booking.raw.amount > 0
    ) {
      return {
        subtotal: booking.raw.amount,
        total: booking.raw.amount,
        seatCount: (booking.seats || []).length || 0,
      };
    }

    const seats = Array.isArray(booking.seats) ? booking.seats : [];
    const subtotal = seats.reduce((s, seat) => {
      if (!seat) return s;
      if (typeof seat === "object" && typeof seat.price === "number")
        return s + seat.price;
      return s;
    }, 0);

    return { subtotal, total: subtotal, seatCount: seats.length };
  }

  useEffect(() => {
    let mounted = true;
    async function fetchMyBookings() {
      setLoading(true);
      setError("");

      try {
        const token = getStoredToken();
        if (!token) {
          navigate("/login");
          return;
        }

        let response;

        try {
          response = await api.get(API_ROUTES.BOOKING.BOOKING_GET, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          });

          console.log("Fetch My Bookings API Response:", response);

          if (response?.data?.success) {
            // toast.success(response?.data?.message);
            console.log("Fetch My Bookings Success:", response?.data?.message);
          } else {
            toast.warn(response?.data?.message);
            console.warn(
              "Fetch My Bookings Data Error:",
              response?.data?.message,
            );
          }
        } catch (error) {
          response = await api.get(API_ROUTES.BOOKING, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          });

          console.log("Fetch Bookings API Response:", response);

          if (response?.data?.success) {
            // toast.success(response?.data?.message);
            console.log("Fetch Bookings Success:", response?.data?.message);
          } else {
            toast.warn(response?.data?.message);
            console.warn("Fetch Bookings Data Error:", response?.data?.message);
          }
        }

        const data = response?.data || {};
        let items = [];

        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.bookings)) items = data.bookings;
        else if (Array.isArray(data.data)) items = data.data;
        else if (data.item && Array.isArray(data.item)) items = data.item;
        else if (data.items && Array.isArray(data.items)) items = data.items;
        else if (data && data._id) items = [data];

        const normalized = items.map((b) => {
          const id = `${b._id || b.id}-${b.showtime || b.createdAt || ""}`;

          const movie = b.movie || {};
          const title =
            movie.title || movie.name || b.movieName || b.title || "Untitled";
          const poster = movie.poster || b.poster || movie.image || "";
          const category = movie.category || b.category || "";
          const durationMins =
            movie.durationMins ?? movie.duration ?? b.durationMins ?? 0;
          const slotTime = b.showtime || b.slotTime || b.slot || null;
          const auditorium = b.auditorium || b.audi || "Audi 1";

          const seats =
            Array.isArray(b.seats) && b.seats.length
              ? b.seats.map((s) =>
                  typeof s === "string"
                    ? { id: s }
                    : {
                        id: s.seatId || s.id || s.name || "",
                        type: s.type,
                        price:
                          typeof s.price === "number" ? s.price : undefined,
                      },
                )
              : [];

          let amount = 0;
          if (b.amountPaise !== undefined && b.amountPaise !== null) {
            amount = Number(b.amountPaise) / 100;
          } else if (typeof b.amount === "number") {
            amount = b.amount;
          } else if (typeof b.total === "number") {
            amount = b.total;
          }

          return {
            id,
            title,
            poster,
            category,
            durationMins,
            slotTime,
            auditorium,
            seats,
            amount,
            amountPaise: b.amountPaise,
            raw: b,
          };
        });

        const unique = Array.from(
          new Map(normalized.map((x) => [x.id, x])).values(),
        );

        if (mounted) setBookings(unique);
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.log("Fetch My Bookings Error:", error);

        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (mounted) {
          setError(
            error?.response?.data?.message ||
              error?.message ||
              "Failed tp load bookings",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMyBookings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const makeQrs = async () => {
      const map = {};
      for (const b of bookings) {
        const seatsList = (b.seats || [])
          .map((s) => (typeof s === "string" ? s : s.id || ""))
          .filter(Boolean);

        const payload = JSON.stringify({
          bookingId: b.id,
          title: b.title,
          time: formatTime(b.slotTime),
          auditorium: b.auditorium,
          seats: seatsList,
        });

        try {
          const url = await QRCode.toDataURL(payload, {
            errorCorrrectionLevel: "M",
            margin: 1,
            scale: 6,
          });
          map[b.id] = { url, payload };
        } catch (error) {
          console.error("QR Error for", b.id.error);
          map[b.id] = { url: "", payload };
        }
      }

      if (mounted) setQrs(map);
    };

    if (bookings.length) makeQrs();
    return () => {
      mounted = false;
    };
  }, [bookings]);

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleQrScan = (bookingId) => {
    const entry = qrs[bookingId];
    if (!entry || !entry.payload) return;

    try {
      const parsed = JSON.parse(entry.payload);
      setExpandedId(bookingId);

      const el = document.getElementById(`booking-card-${bookingId}`);
      if (el && el.scrollIntoView)
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      setScannedDetails({ bookingId, ...parsed });
    } catch (error) {
      console.error("Faild to parse QR payload:", b.id.error);
    }
  };

  const closeModal = () => setScannedDetails(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768) setColCount(1);
      else if (w < 1024) setColCount(2);
      else setColCount(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cols = Array.from({ length: colCount }, () => []);
  bookings.forEach((b, i) => cols[i % colCount].push(b));

  // const cols = [[], [], []];
  // bookings.forEach((b, i) => {
  //   cols[i % 3].push(b);
  // });

  return (
    <div className="min-h-screen bg-black p-6 sm:p-8 text-gray-100">
      <div className="max-w-7xl pt-30 mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-500">
            Your Tickets
          </h1>
          <div className="text-sm text-gray-400">Present QR at entry</div>
        </header>

        {loading && (
          <div className="py-12 text-center text-gray-400 flex items-center gap-2">
            <ClipLoader size={18} color="#A855F7" />
            <span className="text-sm animate-pulse"> Loading Bookings...</span>
          </div>
        )}

        {!loading && error && (
          <div className="py-3 text-center text-purple-300">{error}</div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {bookings.length === 0 && !loading ? (
            <div className="col-span-full text-center text-gray-400 py-8 rounded-lg">
              No Bookings found.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {cols.map((col, i) => (
                <div key={i} className="flex-1 flex flex-col gap-6">
                  {col.map((b) => {
                    const totals = computeTotals(b);
                    const isOpen = expandedId === b.id;

                    return (
                      <article
                        id={`booking-card-${b.id}`}
                        key={b.id}
                        className="relative bg-linear-to-b from-gray-900 to-black rounded-2xl p-4 border border-purple-800 shadow-xl"
                        aria-labelledby={`booking-${b.id}-title`}
                      >
                        <div className="flex flex-col lg:flex-row items-start gap-4">
                          <div className="w-full lg:w-24 h-44 lg:h-36 shrink-0 overflow-hidden rounded-md border border-purple-700">
                            <img
                              src={b.poster || ""}
                              alt={b.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 w-full">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h2
                                  id={`booking-${b.id}-title`}
                                  className="text-lg font-bold text-purple-400 flex items-center gap-2"
                                >
                                  <Theater className="w-5 h-5" />
                                  <span>{b.title}</span>
                                </h2>

                                <div className="text-xs text-gray-400 mt-1">
                                  Booking ID:{" "}
                                  <span className="font-mono text-xs text-gray-200">
                                    {b.id}
                                  </span>
                                </div>
                              </div>

                              <div className="border border-gray-500 p-1 rounded-md text-xs text-gray-400 text-right">
                                <div className="hidden lg:block">
                                  {b.category}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 text-sm text-gray-300 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-300" />
                                <div>{formatTime(b.slotTime)}</div>
                              </div>

                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <MapPin className="w-4 h-4 text-purple-300" />
                                <div className="text-sm">{b.auditorium}</div>
                              </div>
                            </div>

                            <div className="mt-3 text-xs text-gray-400">
                              Duration:
                            </div>
                            <div className="mt-1 text-sm text-gray-200">
                              {formatDurationBooking(b.durationMins)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="text-sm text-gray-400">
                            Seats ({totals.seatCount})
                          </div>
                          <div className="text-sm text-gray-300 font-semibold">
                            LKR {totals.total.toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div
                          className={`mt-4 border-t border-purple-900/40 pt-3 text-sm text-gray-300 space-y-3 transition-all duration-200 ease-in-out ${
                            isOpen
                              ? "max-h-300 opacity-100"
                              : "max-h-0 opacity-0 overflow-hidden"
                          }`}
                          aria-hidden={!isOpen}
                        >
                          <div className="">
                            <div className="text-sm text-gray-400">
                              Seats ({totals.seatCount})
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {(b.seats || []).map((s) => (
                                <div
                                  key={s.id || s}
                                  className="px-3 py-1 rounded-md bg-black/40 border border-purple-800 flex items-center gap-2 text-sm"
                                >
                                  <div className="font-semibold">
                                    {s.id || s}
                                  </div>
                                  <div
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      s.type === "recliner"
                                        ? "bg-purple-700 text-white"
                                        : "bg-gray-800 text-gray-200"
                                    }`}
                                  >
                                    {s.type === "recliner"
                                      ? "Recliner"
                                      : "Standard"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-gray-300">
                              <div>Seats subtotal</div>
                              <div>
                                LKR {totals.subtotal.toLocaleString("en-IN")}
                              </div>
                            </div>

                            <div className="flex items-center justify-between font-semibold text-gray-100 text-lg">
                              <div>Total</div>
                              <div>
                                LKR {totals.total.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <QrCode className="w-4 h-4" />
                              <div>Ticket QR</div>
                            </div>

                            <div className="ml-auto">
                              {qrs[b.id] && qrs[b.id].url ? (
                                <img
                                  src={qrs[b.id].url}
                                  alt={`${b.title} qr`}
                                  className="w-28 h-28 object-contain rounded-md bg-white p-1 cursor-pointer"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => handleQrScan(b.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleQrScan(b.id);
                                  }}
                                />
                              ) : (
                                <div className="w-28 h-28 bg-gray-800 rounded-md flex items-center justify-center text-xs text-gray-500">
                                  QR Unavailable
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => toggle(b.id)}
                            aria-expanded={isOpen}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-700 bg-black/30 hover:bg-black/40 transition"
                          >
                            <span>
                              {isOpen ? "Hide details" : "View details"}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 transform transition-transform duration-200 ${
                                isOpen ? "rotate-180" : "rotate-0"
                              }`}
                            />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -------- Scanner Details -------- */}
      {scannedDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative max-w-md w-full bg-gray-900 rounded-2xl p-6 shadow-2xl text-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-purple-400">
                  {scannedDetails.title}
                </h3>

                <div className="text-sm text-gray-300">
                  BookingID:{" "}
                  <span className="mt-2 text-sm text-gray-300">
                    {scannedDetails.bookingId}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-300">
                  <div>
                    <strong>Time:</strong> {scannedDetails.time}
                  </div>

                  <div className="mt-2">
                    <strong>Auditorium:</strong> {scannedDetails.auditorium}
                  </div>

                  <div className="mt-2">
                    <strong>Seats:</strong>{" "}
                    {Array.isArray(scannedDetails.seats)
                      ? scannedDetails.seats.join(",")
                      : scannedDetails.seats}
                  </div>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/30"
                aria-label="Close scanned details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
