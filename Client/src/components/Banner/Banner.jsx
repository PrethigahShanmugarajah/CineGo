// CineGo / Client / src / components / Banner / Banner.jsx
import Video from "../../assets/MovieBannerVideo.mp4";
import { Info, Star, Tickets } from "lucide-react";
import "./Banner.css";

const Banner = () => {
  return (
    <div className="relative overflow-hidden h-160 sm:h-190 md:h-screen">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={Video} type="video/mp4" />
          {/* -------- Fall Back Text -------- */}
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-black/60 md:bg-transparent"></div>
      </div>

      {/* -------- Content -------- */}
      <div className="relative z-10 flex items-center justify-start h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl mt-10 md:mt-0">
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Dancing Script', 'cursive'" }}
          >
            The Horizon Beyond
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white mb-6 max-w-lg">
            Embark on an epic journey through uncharted lands, where bravery and
            friendship are tested, legends are born, and destiny awaits those
            who dare to chase it.
          </p>

          <div className="flex items-center mr-2">
            <div className="flex items-center mr-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <span className="ml-2 text-white text-sm sm:text-base">
                4.9/5
              </span>
            </div>

            <div className="text-white text-xs sm:text-sm">
              Adventure • Epic • Fantasy
            </div>
          </div>

          <div className="flex flex-wrap gap-3 font-[pacifico] mt-10">
            <a
              href="/movies"
              className="bg-purple-600 cursor-pointer hover:bg-purple-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Tickets className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="white" />
              Book Movies
            </a>

            <a
              href="/contact"
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center transition-all duration-300 border border-gray-300 text-sm sm:text-base"
            >
              <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> More Info
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
