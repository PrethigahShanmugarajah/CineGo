import { Calendar, Play, Star, X } from "lucide-react";
import { displayDuration, formatSlotLM } from "../../../utils/helper";
import PersonGrid from "./PersonGrid";

const DetailView = ({ item, onClose }) => {
  const getTypeGradient = (type) => {
    const gradients = {
      normal: "from-amber-500 to-red-600",
      featured: "from-fuchsia-500 to-purple-600",
      releaseSoon: "from-pink-500 to-violet-600",
      latestTrailers: "from-green-500 to-sky-600",
    };
    return gradients[type] || "from-gray-500 to-gray-600";
  };

  const displayAuditorium =
    item?.auditorium || item?.auditorium === "" ? item.auditorium : "Audi 1";

  return (
    <div className="space-y-6">
      {/* -------- Header -------- */}
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-4 h-4 rounded-full bg-linear-to-r ${getTypeGradient(item.type)}`}
            ></div>
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              {item.type === "featured" && "Featured Movie"}
              {item.type === "normal" && "Now Showing"}
              {item.type === "releaseSoon" && "Coming Soon"}
              {item.type === "latestTrailers" && "Latest Trailer"}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
            {item.movieName || item.title || item.displayTitle}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 p-2.5 gradient-border rounded-xl text-gray-400 hover:text-white hover:border-purple-500/60 transition-all duration-300 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {item.type === "latestTrailers" && (
          <>
            {item.thumbnail && (
              <div className="rounded-2xl overflow-hidden gradient-border">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-56 object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 gradient-border rounded-2xl">
              {item.geners && item.geners.length > 0 && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Genres
                  </div>

                  <div className="text-white font-medium">
                    {(item.geners || []).join(",")}
                  </div>
                </div>
              )}

              {item.year && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Year
                  </div>

                  <div className="text-white font-medium">{item.year}</div>
                </div>
              )}

              {item.duration && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Duration
                  </div>
                  <div className="text-white font-medium">
                    {displayDuration(item)}
                  </div>
                </div>
              )}

              {item.rating && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Rating
                  </div>
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <Star size={16} fill="currentColor" />
                    {item.rating}/10
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-gray-400 text-sm uppercase font-semibold">
                  Auditorium
                </div>
                <div className="text-white font-medium">
                  {displayAuditorium}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-gray-400 text-sm uppercase font-semibold">
                Description
              </div>
              <div className="text-gray-300 leading-relaxed text-base">
                {item.description}
              </div>
            </div>

            {item.trailerUrl && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-linear-to-r from-purple-600 to-purple-700 rounded-2xl text-white font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] shadow-lg"
              >
                <Play size={20} />
                Watch Trailer Now
              </a>
            )}

            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
            <PersonGrid list={item.singers} roleLabel="Singers" />
          </>
        )}

        {(item.type === "normal" || item.type === "featured") && (
          <>
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-2xl overflow-hidden gradient-border">
                <img
                  src={item.poster}
                  alt={item.movieName}
                  className="w-full h-72 object-contain"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 sm:p-5 gradient-border rounded-2xl">
                <div className="space-y-1">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Rating
                  </div>
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <Star size={18} fill="currentColor" />
                    {item.rating ?? "-"}/10
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Duration
                  </div>
                  <div className="text-white font-medium text-lg">
                    {displayDuration(item)}
                  </div>
                </div>

                {item.seatPrices && (
                  <>
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm uppercase font-semibold">
                        Standard
                      </div>
                      <div className="text-pink-400 font-bold text-lg">
                        LKR {item.seatPrices.standard}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm uppercase font-semibold">
                        Recliner
                      </div>
                      <div className="text-pink-400 font-bold text-lg">
                        LKR {item.seatPrices.recliner}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {item.trailerUrl && (
                <a
                  href={item.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 gradient-border rounded-xl text-gray-300 text-sm hover:text-white hover:border-purple-500/60 transition-all duration-300 cursor-pointer justify-center"
                >
                  <Play size={18} />
                  Watch official Trailer
                </a>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                <div className="text-gray-400 text-sm uppercase font-semibold">
                  Story
                </div>
              </div>

              <div className="text-gray-300 leading-relaxed text-base">
                {item.story}
              </div>
            </div>

            {(item.slots || []).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-purple-400" />
                  <div className="text-gray-400 text-sm uppercase font-semibold">
                    Showtimes
                  </div>
                </div>

                <div className="space-y-3">
                  {(item.slots || []).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 gradient-border rounded-2xl hover:border-purple-500/60 transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-white font-medium">
                        {formatSlotLM(s)}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-pink-400 text-xs font-semibold"></div>
                        <span className="text-pink-400 text-xs font-semibold">
                          Available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PersonGrid list={item.cast} roleLabel="Cast" />
            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
          </>
        )}

        {item.type === "releaseSoon" && (
          <div className="text-center space-y-6 py-8">
            <div className="rounded-2xl overflow-hidden gradient-border mx-auto max-w-sm transform transition-transform duration-500">
              <img
                src={item.poster}
                alt={item.movieName}
                className="w-full h-72 object-contain"
              />
            </div>

            <div className="text-gray-400 text-lg font-semibold">
              Coming Soon
            </div>

            <div className="flex justify-center gap-3">
              {(item.categories || []).map((cat, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gray-700/50 rounded-full text-sm text-gray-300 border border-gray-600 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="text-gray-500 text-sm mt-4">
              Stay tuned for more updates!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailView;
