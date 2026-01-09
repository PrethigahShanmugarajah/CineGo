// CineGo / Client / src / components / Navbar / Navbar.jsx
import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Film,
  Home,
  Mail,
  Ticket,
  Theater,
  LogOut,
  User,
  X,
  Menu,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const readAuthFromStorage = () => {
      const json = localStorage.getItem("cine_auth");
      if (json) {
        try {
          const parsed = JSON.parse(json);
          setIsLoggedIn(Boolean(parsed?.isLoggedIn));
          setUserEmail(parsed?.email || "");
          return;
        } catch (error) {}
      }

      const simpleFlog = localStorage.getItem("isLoggedIn");
      const email =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("cine_user_email");

      if (simpleFlog === "true") {
        setIsLoggedIn(true);
        setUserEmail(email || "");
        return;
      }

      if (email) {
        setIsLoggedIn(true);
        setUserEmail(email);
        return;
      }

      setIsLoggedIn(false);
      setUserEmail("");
    };

    readAuthFromStorage();
    const onStorage = (e) => {
      if (
        ["cine_auth", "isLoggedIn", "userEmail", "cine_user_email"].includes(
          e.key
        )
      ) {
        readAuthFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("cine_auth");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("cine_user_email");
    setIsLoggedIn(false);
    setUserEmail("");
    window.location.href = "/login";
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "movies", label: "Movies", icon: Film, path: "/movies" },
    { id: "releases", label: "Releases", icon: Calendar, path: "/releases" },
    { id: "contact", label: "Contact", icon: Mail, path: "/contact" },
    { id: "bookings", label: "Bookings", icon: Ticket, path: "/bookings" },
  ];

  return (
    <nav
      className={`fixed left-4 right-4 top-6 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-black/85 backdrop-blur-sm shadow-xl rounded-3xl"
          : "py-4 bg-black backdrop-blur-sm rounded-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-1 lg:px-1 xl:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 z-20 shrink-0">
          <div className="bg-black p-3 md:p-3 xl:p-3 lg:p-3 rounded-full border border-purple-600">
            <Theater className="h-4 w-4 md:h-2 md:w-2 lg:h-4 lg:w-4 xl:w-4 xl:h-4  text-purple-500" />
          </div>

          <div className="text-lg md:text-sm xl:text-lg lg:text-lg font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-purple-200 font-[pacifico]">
            CineGo
          </div>
        </div>

        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 z-10 items-center bg-black/70 backdrop-blur-md rounded-full px-3 py-2 gap-2 shadow-inner">
          <div className="flex gap-2 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `nav-pill-btn flex items-center gap-3 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                        isActive ? "active text-white" : "text-gray-300"
                      }`
                    }
                  >
                    <Icon className="h-6 w-6" />

                    <span>{item.label}</span>
                    <div className="pill-underline"></div>
                  </NavLink>
                  <span className="pill-border"></span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 z-20">
          <div className="hidden md:flex lg:hidden items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `nav-pill-btn flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "active bg-purple-900/30 text-white shadow-lg"
                        : "text-gray-300 hover:bg-purple-900/30"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* -------- Auth Section -------- */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              {isLoggedIn ? (
                <button
                  title={userEmail || "Logout"}
                  onClick={handleLogout}
                  className="flex items-center gap-2 md:px-1.5 px-4 lg:px-4 xl:px-4  py-2 rounded-full bg-linear-to-r from-gray-700 to-gray-800 text-white text-sm font-semibold border border-purple-600/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <a
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 md:px-1.5 lg:px-4 xl:px-4 rounded-full bg-linear-to-r from-purple-300 to-purple-700 text-white text-sm font-semibold border border-purple-600/20"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </a>
              )}
            </div>

            {/* -------- Toggle Function -------- */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                className="p-2 rounded-full bg-black/60 text-gray-200 hover:text-purple-400"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden absolute left-4 right-4 top-full mt-6 bg-black backdrop-blur-md rounded-2xl p-4 shadow-xl"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl ${
                        isActive
                          ? "bg-linear-to-r from-purple-600 to-purple-500 text-white"
                          : "text-gray-300 hover:bg-purple-900/30"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}

              <div className="pt-2 border-t border-gray-300 mt-1">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full mt-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-700 to-gray-800 text-white flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                ) : (
                  <a
                    href="/login"
                    className="w-full mt-3 px-4 py-3 rounded-xl bg-linear-to-r from-purple-600 to-purple-500 text-white flex items-center justify-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
