import { useEffect, useState } from "react";
import {
  ArrowUp,
  Clapperboard,
  Facebook,
  Film,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Popcorn,
  Star,
  Theater,
  Ticket,
  Twitter,
  Youtube,
} from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const links = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "Releases", href: "/releases" },
    { label: "Contact", href: "/contact" },
    { label: "Login", href: "/login" },
  ];

  const genreLinks = [
    { label: "Horror", href: "/movies" },
    { label: "Thriller", href: "/movies" },
    { label: "Action", href: "/movies" },
    { label: "Drama", href: "/movies" },
    { label: "Comedy", href: "/movies" },
  ];

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const floatingIcons = [Clapperboard, Film, Star, Ticket, Popcorn];

  return (
    <footer className="relative bg-black text-white overflow-hidden border-t border-purple-800">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-purple-600 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute -top-12 -left-12 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-purple-600 rounded-full filter blur-3xl animate-pulse"></div>

        <div className="absolute -right-16 -bottom-16 w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-800 rounded-full filter blur-3xl"></div>
      </div>

      <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
        {[...Array(12)].map((_, i) => {
          const IconComponent = floatingIcons[i % floatingIcons.length];
          const left = (i * 23) % 100;
          const top = (i * 17) % 100;
          const dur = 6 + (i % 5);
          const delay = (i % 4) * 0.6;
          return (
            <div
              key={i}
              className="absolute text-purple-600 animate-float"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `float ${dur}s infinite ease-in-out`,
                animationDelay: `${delay}s`,
              }}
            >
              <IconComponent className="w-8 h-8" />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 sm:gap-10 mb-12 md:mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute -inset-1 sm:-inset-2 bg-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative bg-black p-2 sm:p-3 rounded-full border border-purple-600">
                  <Theater className="h-7 w-7 sm:h-8 sm:w-8 text-purple-500" />
                </div>
              </div>

              <h2 className="footer-logo-text ml-3 sm:ml-4 text-2xl sm:text-3xl font-bold text-purple-600">
                Cine<span className="text-white">Go</span>
              </h2>
            </div>

            <p className="text-gray-500 mb-6 sm:mb-8 font-light text-sm sm:text-base leading-relaxed">
              Experience the dark side of cinema with the latest news, reviews,
              and exclusive content.
            </p>

            <div className="flex space-x-3 sm:space-x-5">
              {[
                { Icon: Facebook },
                { Icon: Twitter },
                { Icon: Instagram },
                { Icon: Youtube },
              ].map((item, index) => (
                <a
                  href="#"
                  key={index}
                  className="text-gray-500 p-2 sm:p-3 rounded-full transform transition-all duration-300 hover:scale-110 hover:text-purple-500 border border-gray-500 hover:border-purple-600"
                >
                  <item.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center text-purple-600">
              <div className="w-2.5 h-2.5 bg-purple-600 rounded-full mr-3 animate-pulse" />
              Explore
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-500 hover:text-purple-500 transition-all duration-300 flex items-center group transform hover:translate-x-2 text-sm sm:text-base"
                  >
                    <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-block" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center text-purple-600">
              <div className="w-2.5 h-2.5 bg-purple-600 rounded-full mr-3 animate-pulse" />
              Genres
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {genreLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <a
                    href={link.href}
                    className="text-gray-500 hover:text-purple-500 transition-all duration-300 flex items-center group transform hover:translate-x-2 text-sm sm:text-base"
                  >
                    <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-block" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center text-purple-600">
              <div className="w-2.5 h-2.5 bg-purple-600 rounded-full mr-3 animate-pulse" />
              Contact Us
            </h3>

            <ul className="space-y-4 sm:space-y-5 text-sm sm:text-base">
              <li className="flex items-start">
                <div className="bg-black p-2 rounded-lg mr-3 border border-purple-600">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <span className="text-gray-500">cinego@cinego.com</span>
              </li>

              <li className="flex items-start">
                <div className="bg-black p-2 rounded-lg mr-3 border border-purple-600">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <span className="text-gray-500">+94 12 345 6789</span>
              </li>

              <li className="flex items-start">
                <div className="bg-black p-2 rounded-lg mr-3 border border-purple-600">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <span className="text-gray-500">Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative h-px bg-linear-to-r from-transparent via-purple-600 to-transparent mb-8 sm:mb-10">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black p-1.5 sm:p-2 rounded-full border border-purple-600">
            <Theater className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="text-sm flex items-center text-gray-500 sm:text-sm">
            © {currentYear}
            <a
              href="#"
              target="_blank"
              className="ml-1 font-medium hover:text-blue-500 transition-colors duration-300"
              rel="noopener noreferrer"
            >
              CineGo
            </a>
            . All rights reserved.
          </div>

          <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-500 hover:text-purple-500 transition-colors duration-300"
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
      </div>

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 cursor-pointer bg-purple-700 hover:bg-purple-600 text-white p-2 sm:p-2 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 z-20 group border border-purple-500"
        >
          <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
