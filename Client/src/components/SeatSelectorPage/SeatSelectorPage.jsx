// CineGo / Client / src / components / SeatSelectorPage / SeatSelectorPage.jsx
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  RockingChair,
  Sofa,
  Ticket,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import movies from "../../assets/dummymdata";
import "./SeatSelectorPage.css";

const ROWS = [
  { id: "A", type: "standard", count: 8 },
  { id: "B", type: "standard", count: 8 },
  { id: "C", type: "standard", count: 8 },
  { id: "D", type: "recliner", count: 8 },
  { id: "E", type: "recliner", count: 8 },
];

const seatId = (r, n) => `${r}${n}`;

const SeatSelectorPage = () => {
  const { id, slot } = useParams();
  const movieId = Number(id);
  const slotKey = slot ? decodeURIComponent(slot) : "";

  const navigate = useNavigate();

  const movie = useMemo(
    () => (movies || []).find((m) => Number(m.id) === movieId),
    [movieId],
  );

  useEffect(() => {
    const isValidDate = !!slotKey && !isNaN(new Date(slotKey).getTime());
    if (!isValidDate) {
      toast.error(
        "Invalid or missing showtime. Please select a time from the movie page.",
      );
      setTimeout(() => {
        if (movie) navigate(`/movie/${movie.id}`);
        else navigate("/movies");
      }, 600);
    }
  }, [slotKey, movie, navigate]);

  const storageKey = `bookings_${movieId}_${slotKey}`;

  const [booked, setBooked] = useState(new Set());
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (!movie) {
      toast.error("Movie not found.");
      setTimeout(() => navigate("/movies"), 600);
      return;
    }
  }, [movie, navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);

      if (raw) {
        const arr = JSON.parse(raw);
        setBooked(new Set(arr));
      } else {
        setBooked(new Set());
      }
    } catch (error) {
      setBooked(new Set());
    }
    setSelected(new Set());
  }, [storageKey]);

  const toggleSeat = (id) => {
    if (booked.has(id)) {
      console.log(`Seat ${id} is already booked. Booking details:`, {
        movie: movie?.title,
        showtime: slotKey,
        seat: id,
        status: "booked",
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const confirmBooking = () => {
    if (selected.size === 0) {
      toast.error("Select at least one seat.");
      return;
    }

    const newBooked = new Set([...booked, ...selected]);
    localStorage.setItem(storageKey, JSON.stringify([...newBooked]));

    const bookingDetails = {
      movie: movie?.title,
      movieId: movieId,
      showtime: slotKey,
      audi: audiForSlot || null,
      bookedSeats: [...selected].sort(),
      totalSeats: selected.size,
      totalAmount: Math.round(
        [...selected].reduce((sum, s) => {
          const rowLetter = s[0];
          const def = ROWS.find((r) => r.id === rowLetter);
          const multiplier = def?.type === "recliner" ? 1.5 : 1;
          return sum + (movie?.price ?? 0) * multiplier;
        }, 0),
      ),
      bookingTime: new Date().toISOString(),
      bookingId: `B${Date.now()}`,
    };

    console.log("Booking Confirmed:", bookingDetails);
    console.table(bookingDetails);

    setBooked(newBooked);
    setSelected(new Set());

    toast.success(
      <div>
        <div className="font-bold">Booking Confirmed!</div>
        <div className="text-sm">
          {bookingDetails.totalSeats} seat(s) booked successfully
        </div>
      </div>,
    );
  };

  const basePrice = movie?.price ?? 0;
  const total = [...selected].reduce((sum, s) => {
    const rowLetter = s[0];
    const def = ROWS.find((r) => r.id === rowLetter);
    const multiplier = def?.type === "recliner" ? 1.5 : 1;
    return sum + basePrice * multiplier;
  }, 0);

  const selectedCount = selected.size;

  const audiForSlot = useMemo(() => {
    if (!movie || !slotKey) return null;

    try {
      const targetMs = new Date(slotKey).getTime();
      if (isNaN(targetMs)) return null;

      const slots = movie.slots || [];
      for (const s of slots) {
        let timeStr = null;
        if (typeof s === "string") timeStr = s;
        else if (s.datetime) timeStr = s.datetime;
        else if (s.time) timeStr = s.time;
        else if (s.iso) timeStr = s.iso;
        else if (s.date) timeStr = s.date;

        if (!timeStr) continue;
        const sMs = new Date(timeStr).getTime();
        if (sMs === targetMs) {
          return s.audi || s.audiName || s.auditorium || null;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [movie, slotKey]);

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-all px-4 py-3 rounded-xl hover:bg-purple-900/20"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-4xl md:text-6xl py-1 font-bold tracking-wider mb-2 bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {movie?.title}
            </h1>
            <div className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-2">
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

          <div className="ml-auto flex items-center">
            {audiForSlot && (
              <div className="audi-badge" title={`Auditorium: ${audiForSlot}`}>
                {audiForSlot}
              </div>
            )}
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
          <div className="flex flex-col items-center gap-6">
            {ROWS.map((row) => (
              <div
                key={row.id}
                className="w-full max-w-4xl flex flex-col items-center"
              >
                <div className="w-full flex items-center justify-center mb-3">
                  <div className="w-12 mx-2 text-lg font-bold text-purple-400 text-center">
                    {row.id}
                  </div>

                  <div className="flex-1 flex justify-center">
                    <div className="seat-grid">
                      {Array.from({ length: row.count }).map((_, i) => {
                        const num = i + 1;

                        const id = seatId(row.id, num);
                        const isBooked = booked.has(id);
                        const isSelected = selected.has(id);

                        return (
                          <button
                            key={id}
                            onClick={() => toggleSeat(id)}
                            disabled={isBooked}
                            className={`seat-btn flex items-center justify-center font-semibold transition-transform duration-200 transform 
                              ${
                                isBooked
                                  ? "opacity-40 cursor-not-allowed bg-gray-800 text-gray-500"
                                  : ""
                              }
                              ${
                                isSelected
                                  ? row.type === "recliner"
                                    ? "bg-linear-to-br from-pink-500 to-pink-700 text-white shadow-2xl"
                                    : "bg-linear-to-br from-purple-500 to-purple-700 text-white shadow-2xl"
                                  : row.type === "recliner"
                                    ? "bg-pink-900 text-pink-200 hover:scale-105"
                                    : "bg-gray-800 text-gray-200 hover:scale-105"
                              }
                            `}
                            title={
                              isBooked
                                ? `Seat ${id} - Already Booked`
                                : `Seat ${id} (${row.type}) - LKR${row.type === "recliner" ? Math.round(basePrice * 1.5) : basePrice}`
                            }
                          >
                            <div className="flex flex-col items-center justify-center">
                              {row.type === "recliner" ? (
                                <Sofa size={16} className="seat-icon" />
                              ) : (
                                <RockingChair size={12} className="seat-icon" />
                              )}

                              <div className="text-xs mt-0.5 font-bold seat-num">
                                {num}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="w-20 px-5 text-sm font-semibold text-gray-400 capitalize text-center">
                    {row.type}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* -------- Booking Summary -------- */}
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
                    className="flex-1 px-4 py-3 rounded-full bg-linear-to-r from-purple-600 to-purple-700 text-white font-bold hover:from-purple-700 hover:to-purple-800 transition-all transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      LKR {basePrice}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-300">Recliner</div>

                    <div className="font-bold text-purple-400">
                      LKR {Math.round(basePrice * 1.5)}
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

export default SeatSelectorPage;
