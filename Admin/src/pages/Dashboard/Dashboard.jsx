import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { toast } from "react-toastify";
import "./Dashboard.css";
import { Banknote, Ticket, Users } from "lucide-react";
import { fmtLKR } from "../../utils/helper";

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      let rawMovies = [];
      let rawBookings = [];
      let rawUsers = [];

      try {
        /* -------- Movies -------- */
        try {
          const mRes = await api.get(API_ROUTES.MOVIE.MOVIES_GET);

          // console.log("Fetch Movies API Response:", mRes);

          if (mRes?.data?.success) {
            // toast.success(mRes?.data?.message);
            // console.log("Fetch Movies Success:", mRes?.data?.message);
          } else {
            toast.warn(mRes?.data?.message || "Failed to fetch movies");
            console.warn("Fetch Movies Data Error:", mRes?.data?.message);
          }

          rawMovies = Array.isArray(mRes?.data?.items) ? mRes.data.items : [];
        } catch (error) {
          toast.error(error?.response?.data?.message || error?.message);
          console.log("Fetch Movies Error:", error);
        }

        /* -------- Bookings -------- */
        try {
          const bRes = await api.get(API_ROUTES.BOOKING.BOOKING_LIST);

          // console.log("Fetch Bookings API Response:", bRes);

          if (bRes?.data?.success) {
            // toast.success(bRes?.data?.message);
            // console.log("Fetch Bookings Success:", bRes?.data?.message);
          } else {
            toast.warn(bRes?.data?.message || "Failed to fetch bookings");
            console.warn("Fetch Bookings Data Error:", bRes?.data?.message);
          }

          rawBookings = Array.isArray(bRes?.data?.items) ? bRes.data.items : [];
        } catch (error) {
          toast.error(error?.response?.data?.message || error?.message);
          console.log("Fetch Bookings Error:", error);
        }

        /* -------- Users -------- */
        try {
          const uRes = await api.get(API_ROUTES.USER.USER_GET);

          // console.log("Fetch Users API Response:", uRes);

          if (uRes?.data?.success) {
            // toast.success(uRes?.data?.message);
            // console.log("Fetch Users Success:", uRes?.data?.message);

            rawUsers = Array.isArray(uRes?.data?.items)
              ? uRes.data.items
              : Array.isArray(uRes?.data)
                ? uRes.data
                : [];
          } else {
            toast.warn(uRes?.data?.message || "Failed to fetch users");
            console.warn("Fetch Users Data Error:", uRes?.data?.message);
          }
        } catch (error) {
          toast.error(error?.response?.data?.message || error?.message);
          console.log("Fetch Users Error:", error);
        }

        const normMovies = rawMovies.map((m) => ({
          id: m._id || m.id || "",
          title: m.title || m.movieName || "Untitled",
          basePrice: Number(m.basePrice || m.price || 0) || 0,
        }));

        const normBookings = rawBookings.map((b) => {
          const movieId =
            b.movieId || (b.movie && (b.movie.id || b.movie._id)) || "";

          const movieTitle =
            (b.movie && (b.movie.title || b.movie.movieName)) ||
            b.movieName ||
            "";

          const seats = Array.isArray(b.seats)
            ? b.seats
                .map((s) =>
                  typeof s === "string" ? s : (s && (s.seatId || s.id)) || "",
                )
                .filter(Boolean)
            : [];

          const totalPaid =
            (Number.isFinite(Number(b.amountPaise))
              ? Number(b.amountPaise) / 100
              : Number(b.amount)) || 0;

          return {
            id: b._id || "",
            movieId,
            movieTitle,
            seats,
            totalPaid,
            userId: b.userId || "",
            raw: b,
          };
        });

        const normUsers = rawUsers.map((u) => ({
          id: u._id || u.id || "",
          name: u.fullName || u.username || u.name || "",
          email: u.email || "",
          phone: u.phone || "",
        }));

        if (!cancelled) {
          setMovies(normMovies);
          setBookings(normBookings);
          setUsers(normUsers);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.log("Get Dashboard Error:", error);
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const totalBookings = bookings.length;

    let totalRevenue = 0;

    let paidCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    for (let i = 0; i < bookings.length; i++) {
      const bk = bookings[i];
      const raw = bk.raw || {};

      const status = (
        raw.paymentStatus ||
        raw.payment_status ||
        raw.status ||
        ""
      )
        .toString()
        .toLowerCase();

      if (status === "paid" || status === "confirmed") {
        paidCount += 1;
        totalRevenue += Number(bk.totalPaid) || 0;
      } else if (status === "pending") {
        pendingCount += 1;
      } else if (status === "failed") {
        failedCount += 1;
      }
    }

    const usersFromApi = new Set(users.map((u) => u.id).filter(Boolean));

    const usersFromBookings = new Set();
    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];
      if (b.userId) usersFromBookings.add(String(b.userId));
      else if (b.customer) usersFromBookings.add(String(b.userId));
      else if (b.raw && b.raw.email) usersFromBookings.add(String(b.raw.email));
      else if (b.raw && b.raw.customerEmail)
        usersFromBookings.add(String(b.raw.customerEmail));
    }

    const totalUsers =
      usersFromApi.size > 0 ? usersFromApi.size : usersFromBookings.size;

    const movieTitleMap = {};
    for (let i = 0; i < movies.length; i++) {
      const m = movies[i];
      if (m.id) movieTitleMap[m.id] = m.title;
    }

    const map = {};

    for (let i = 0; i < bookings.length; i++) {
      const bk = bookings[i];
      const raw = bk.raw || {};

      const status = (
        raw.paymentStatus ||
        raw.payment_status ||
        raw.status ||
        ""
      )
        .toString()
        .toLowerCase();

      if (status !== "paid" && status !== "confirmed") continue;

      const key = bk.movieId || bk.movieTitle || `unknown-${i}`;
      const title = movieTitleMap[bk.movieId] || bk.movieTitle || "unknown";

      if (!map[key]) map[key] = { id: key, title, bookings: 0, earings: 0 };
      map[key].bookings += 1;
      map[key].earings += Number(bk.totalPaid) || 0;
    }

    const movieStats = Object.values(map).sort(
      (a, b) => b.bookings - a.bookings,
    );

    return {
      totalBookings,
      totalRevenue,
      totalUsers,
      paidCount,
      pendingCount,
      failedCount,
      movieStats,
    };
  }, [movies, bookings, users]);

  return (
    <div className="dashboard-font min-h-screen bg-black text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-500">
              Dashboard
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Overview of paid bookings, revenue and users
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-purple-800 bg-linear-to-b from-gray-900/60 to-black p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Total Bookings</div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                  {summary.totalBookings}
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg bg-purple-800/20 text-purple-300 text-sm font-medium">
                <Ticket size={20} />
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <div>
                Paid: {summary.paidCount} | Pending: {summary.pendingCount} |
                Failed: {summary.failedCount}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-800 bg-linear-to-b from-gray-900/60 to-black p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Total Revenue</div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                  {fmtLKR(summary.totalRevenue)}
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg bg-purple-800/20 text-purple-300 text-sm font-medium">
                <Banknote size={20} />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Paid bookings summed
            </div>
          </div>

          <div className="rounded-2xl border border-purple-800 bg-linear-to-b from-gray-900/60 to-black p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Total Users</div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                  {summary.totalUsers}
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg bg-purple-800/20 text-purple-300 text-sm font-medium">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Registered or booking users
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-purple-800 bg-linear-to-b from-gray-900 to-black p-4 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold text-purple-300">
              Movies - Bookings & Earnings
            </div>

            <div className="text-sm text-gray-400">
              {summary.movieStats.length} movie(s)
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-xs text-gray-400 text-left border-b border-purple-900/30">
                  <th className="py-2 px-3">Movie</th>
                  <th className="py-2 px-3">Total Bookings</th>
                  <th className="py-2 px-3">Total Earnings</th>
                  <th className="py-2 px-3">Avg per Booking</th>
                </tr>
              </thead>

              <tbody>
                {summary.movieStats.map((m) => {
                  const avg = m.bookings
                    ? Math.round(m.earings / m.bookings)
                    : 0;

                  return (
                    <tr
                      key={m.id}
                      className="border-b border-purple-900/20 hover:bg-white/2 transition-colors"
                    >
                      <td className="py-3 px-3 text-sm text-gray-200">
                        <div className="font-semibold text-white">
                          {m.title}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-sm text-gray-200">
                        {m.bookings}
                      </td>

                      <td className="py-3 px-3 text-sm text-purple-300 font-semibold">
                        {fmtLKR(m.earings)}
                      </td>

                      <td className="py-3 px-3 text-sm text-gray-300">
                        {fmtLKR(avg)}
                      </td>
                    </tr>
                  );
                })}

                {summary.movieStats.length === 0 && (
                  <tr className="border-b border-purple-900/20">
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No Movie Data Yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {summary.movieStats.map((m) => {
              const avg = m.bookings ? Math.round(m.earings / m.bookings) : 0;
              return (
                <div
                  key={m.id}
                  className="bg-linear-to-b from-gray-900/70 to-black border border-purple-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white text-base">
                        {m.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Bookings{" "}
                        <span className="text-gray-200 font-medium">
                          {m.bookings}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-purple-300 font-semibold">
                        {fmtLKR(m.earings)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Avg:{" "}
                        <span className="text-gray-300">{fmtLKR(avg)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {summary.movieStats.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No Movie Data Yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
