// CineGo / Admin / src / App.jsx
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import ListMovies from "./pages/ListMovies";
import Navbar from "./components/Navbar";
import Bookings from "./pages/Bookings";
import AddMovie from "./pages/AddMovie";

const App = () => {
  return (
    <>
      <ToastContainer theme="dark" style={{ zIndex: 9999 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listmovies" element={<ListMovies />} />
        <Route path="/addmovies" element={<AddMovie />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </>
  );
};

export default App;
