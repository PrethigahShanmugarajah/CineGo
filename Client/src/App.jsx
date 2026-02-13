import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Footer from "./components/Footer/Footer";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./pages/SignUp/SignUp";
import Movie from "./pages/Movie/Movie";
import Release from "./pages/Release/Release";
import Booking from "./pages/Booking/Booking";
import Contact from "./pages/Contact/Contact";
import MovieDetailPage from "./pages/MovieDetailPage/MovieDetailPage";
import MovieDetailPageHome from "./pages/MovieDetailPageHome/MovieDetailPageHome";
import SeatSelector from "./pages/SeatSelector/SeatSelector";
import SeatSelectorHome from "./pages/SeatSelectorHome/SeatSelectorHome";
import VerifyPayment from "./pages/VerifyPayment/VerifyPayment";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window == "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (error) {}
    }
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el =
        document.getElementById(id) || document.querySelector(location.hash);

      if (el) {
        el.scrollIntoView({
          behavior: "auto",
          block: "start",
          inline: "nearest",
        });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return;
      }
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search, location.hash]);

  return null;
}

const App = () => {
  const location = useLocation();

  const hideNavbarRoutes = [
    /^\/movies\/\d+$/,
    /^\/movie\/\d+$/,
    /^\/movies\/\d+\/seat/,
    /^\/movie\/\d+\/seat/,
    /^\/movies\/\d+\/seat-selector/,
    /^\/movie\/\d+\/seat-selector/,
  ];

  const hideNavbar = hideNavbarRoutes.some((pattern) =>
    pattern.test(location.pathname),
  );

  return (
    <>
      <ScrollToTop />

      <ToastContainer theme="dark" style={{ zIndex: 9999 }} />
      <div className="min-h-screen w-full overflow-x-hidden">
        {!hideNavbar && <Navbar />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/movies" element={<Movie />} />
          <Route path="/releases" element={<Release />} />
          <Route path="/bookings" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/movie/:id" element={<MovieDetailPageHome />} />

          <Route path="/movies/:id/seat/:slot" element={<SeatSelector />} />
          <Route
            path="/movies/:id/seat-selector/:slot"
            element={<SeatSelector />}
          />

          <Route path="/movie/:id/seat/:slot" element={<SeatSelectorHome />} />
          <Route
            path="/movie/:id/seat-selector/:slot"
            element={<SeatSelectorHome />}
          />

          <Route path="/success" element={<VerifyPayment />} />
          <Route path="/cancel" element={<VerifyPayment />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
};

export default App;
