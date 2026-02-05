// CineGo / Admin / src / components / Navbar.jsx
import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Film,
  List,
  Menu,
  Theater,
  Ticket,
  XIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const toggleOpen = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const NavItem = ({ to, Icon, label, end = false, onClick }) => (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center space-x-2 px-4 py-2 rounded-full border border-purple-800 transition-all duration-300 transform 
          ${
            isActive
              ? "bg-purple-700 hover:from-purple-800 scale-105 shadow-lg shadow-purple-900/50"
              : "bg-linear-to-r from-purple-900 to-black hover:from-purple-800 hover:to-black"
          }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-5 h-5 transition-colors 
              ${
                isActive
                  ? "text-white"
                  : "text-purple-400 group-hover:text-purple-300"
              }`}
          />

          <span
            className={`font-['Arial_Black'] text-sm tracking-wide transition-colors 
              ${
                isActive
                  ? "text-white"
                  : "text-white group-hover:text-purple-200"
              }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav className="bg-black border-b-2 border-purple-600 shadow-2xl relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* -------- Logo -------- */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-full transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Theater className="w-6 h-6 text-white transform -rotate-12" />
            </div>

            <span className="font-['Impact'] text-2xl text-white tracking-wider bg-linear-to-r from-purple-600 to-purple-400 bg-clip-text">
              CineGo
            </span>
          </div>

          <div className="hidden lg:flex lg:space-x-4">
            <NavItem to="/" Icon={Calendar} label="DASHBOARD" end />
            <NavItem to="/addmovies" Icon={Film} label="ADD MOVIES" />
            <NavItem to="/listmovies" Icon={List} label="LIST MOVIES" />
            <NavItem to="/bookings" Icon={Ticket} label="BOOKINGS" />
          </div>

          {/* -------- Toggle -------- */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleOpen}
              className="inline-flex items-center justify-center p-2 rounded-md text-purple-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600"
            >
              <span className="sr-only">Open main menu</span>
              {/* {open ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )} */}

              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 
        ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 
            ${open ? "opacity-100" : "opacity-0"}`}
          onClick={close}
        >
          <aside
            id="mobile-menu"
            className={`fixed top-0 right-0 h-full w-72 max-w-full bg-linear-to-b from-black/95 to-black/90 border-l border-purple-800 shadow-2xl transform transition-transform duration-300 lg:hidden 
              ${open ? "translate-x-0" : "translate-x-full"}`}
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-purple-800">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-full transform rotate-12">
                  <Film className="w-6 h-6 text-white transform -rotate-12" />
                </div>

                <span className="font-['Impact'] text-xl text-white tracking-wider">
                  CineGo
                </span>
              </div>

              <button
                onClick={close}
                className="p-2 rounded-full hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <XIcon className="w-5 h-5 text-purple-200" />
              </button>
            </div>

            <nav className="px-4 py-6 space-y-3">
              <NavLink
                to="/"
                end
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors 
                    ${
                      isActive
                        ? "bg-purple-700 text-white shadow-md"
                        : "hover:bg-white/5 text-purple-200"
                    }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Calendar
                      className={`w-5 h-5 
                        ${isActive ? "text-white" : "text-purple-300"}`}
                    />
                    <span className="font-semibold">DASHBOARD</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/addmovies"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors 
                    ${
                      isActive
                        ? "bg-purple-700 text-white shadow-md"
                        : "hover:bg-white/5 text-purple-200"
                    }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Film
                      className={`w-5 h-5 
                        ${isActive ? "text-white" : "text-purple-300"}`}
                    />
                    <span className="font-semibold">ADD MOVIES</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/listmovies"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors 
                    ${
                      isActive
                        ? "bg-purple-700 text-white shadow-md"
                        : "hover:bg-white/5 text-purple-200"
                    }`
                }
              >
                {({ isActive }) => (
                  <>
                    <List
                      className={`w-5 h-5 ${isActive ? "text-white" : "text-purple-300"}`}
                    />
                    <span className="font-semibold">LIST MOVIES</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/bookings"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors 
                    ${
                      isActive
                        ? "bg-purple-700 text-white shadow-md"
                        : "hover:bg-white/5 text-purple-200"
                    }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Ticket
                      className={`w-5 h-5 ${isActive ? "text-white" : "text-purple-300"}`}
                    />
                    <span className="font-semibold">BOOKINGS</span>
                  </>
                )}
              </NavLink>
            </nav>

            {/* -------- Footer -------- */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-800">
              <p className="text-base text-purple-300">
                &copy; {new Date().getFullYear} CineGo
              </p>
            </div>
          </aside>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
