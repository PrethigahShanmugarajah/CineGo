// CineGo / Client / src / App.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer/Footer";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./pages/SignUp";
import Movie from "./pages/Movie";
import Release from "./pages/Release";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import MovieDetailPage from "./pages/MovieDetailPage/MovieDetailPage";
import MovieDetailPageHome from "./pages/MovieDetailPageHome/MovieDetailPageHome";
import SeatSelector from "./pages/SeatSelector/SeatSelector";
import SeatSelectorHome from "./pages/SeatSelectorHome/SeatSelectorHome";

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
        </Routes>
        <Footer />
      </div>
    </>
  );
};

export default App;
