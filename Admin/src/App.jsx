import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Dashboard from "./pages/Dashboard/Dashboard";
import ListMovies from "./pages/ListMovies/ListMovies";
import Navbar from "./components/Navbar";
import AddMovie from "./pages/AddMovie/AddMovie";
import Bookings from "./pages/Bookings/Bookings";

const App = () => {
  return (
    <>
      <ToastContainer theme="dark" style={{ zIndex: 9999 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/listmovies" element={<ListMovies />} />
        <Route path="/addmovies" element={<AddMovie />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </>
  );
};

export default App;
