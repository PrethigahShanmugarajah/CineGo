// CineGo / Client / src / App.jsx
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import SignUp from "./pages/SignUp";
import Movie from "./pages/Movie";
import Release from "./pages/Release";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import MovieDetailPage from "./pages/MovieDetailPage";
import MovieDetailPageHome from "./pages/MovieDetailPageHome";
import SeatSelector from "./pages/SeatSelector";
import SeatSelectorPageHome from "./components/SeatSelectorPageHome";

const App = () => {
  return (
    <>
      <ToastContainer />
      <div className="min-h-screen w-full overflow-x-hidden">
        {/* <Navbar /> */}
        <Navbar />
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
          <Route
            path="/movie/:id/seat/:slot"
            element={<SeatSelectorPageHome />}
          />
          <Route
            path="/movie/:id/seat-selector/:slot"
            element={<SeatSelectorPageHome />}
          />
        </Routes>
        <Footer />
      </div>
    </>
  );
};

export default App;
