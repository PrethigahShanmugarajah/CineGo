import { Clock, Play, PlayIcon, Star, Trash2 } from "lucide-react";
import { displayDuration } from "../../../utils/helper";

const Card = ({ item, onOpen, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      featured: "from-fuchsia-500 to-purple-600",
      normal: "from-amber-500 to-red-600",
      releaseSoon: "from-pink-500 to-violet-600",
      latestTrailers: "from-green-500 to-sky-600",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  const posterOrThumb =
    item.poster ||
    item.thumbnail ||
    item.image ||
    item.latestTrailer?.thumbnail ||
    null;

  return (
    <div
      className="card-hover bg-gray-800/40 rounded-2xl overflow-hidden gradient-border cursor-pointer group relative"
      onClick={onOpen}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onDelete === "function") onDelete();
        }}
        title="Delete"
        aria-label={`Delete ${item.movieName || item.title}`}
        className="absolute top-3 right-3 z-10 p-2 cursor-pointer rounded-full bg-red-700/90 hover:bg-red-800 text-white transition-colors"
      >
        <Trash2 size={14} />
      </button>

      <div className="relative">
        <img
          src={posterOrThumb}
          alt={item.movieName || item.title || item.displayTitle}
          className="w-full h-44 sm:h-52 md:h-48 lg:h-52 object-contain transition-transform duration-500"
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white truncate group-hover:text-purple-300 transition-colors mb-1">
              {item.movieName || item.title || item.displayTitle}
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {(item.categories || item.geners || []).map((cat, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-700/50 rounded-lg text-xs text-gray-300 border border-gray-600"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 ml-3">
            {item.type !== "releaseSoon" && (
              <>
                {item.rating && (
                  <div className="flex items-center gap-1.5 bg-teal-500/20 px-3 py-1 rounded-full text-sm">
                    <Star
                      className="text-teal-400"
                      size={14}
                      fill="currentColor"
                    />

                    <span className="text-teal-400 text-sm font-bold">
                      {item.rating}
                    </span>
                  </div>
                )}

                {displayDuration(item) && (
                  <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full text-sm">
                    <Clock className="text-amber-400" size={14} />
                    <span className="text-amber-400 text-sm">
                      {displayDuration(item)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 min-h-14">
          {(item.story || item.description || item.excerpt || "").slice(0, 150)}
          {(item.story || item.description || item.excerpt || "").length >
            150 && "..."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="flex items-center gap-2 px-4 md:px-2 md:text-xs py-2 bg-linear-to-r from-purple-600 to-purple-700 rounded-xl text-white text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 cursor-pointer"
            >
              <Play size={16} />
              View Details
            </button>

            {item.trailerUrl && item.type !== "releaseSoon" && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-3 py-2 gradient-border rounded-xl text-gray-300 text-sm hover:text-white hover:border-purple-500/60 transition-all duration-300 cursor-pointer"
              >
                <PlayIcon className="w-4 h-4 text-purple-500" />
                Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
