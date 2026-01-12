// CineGo / Client / src / components / MoviesPage / MoviesPage.jsx
import { useEffect, useState } from "react";
import MOVIES from "../../assets/dummymdata";
import { Link } from "react-router-dom";

const MoviesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const movies = MOVIES;

  const filteredMovies =
    activeCategory === "all"
      ? movies
      : movies.filter((movie) => movie.category === activeCategory);

  const COLLAPSE_COUNT = 12;

  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  const visibleMovies = showAll
    ? filteredMovies
    : filteredMovies.slice(0, COLLAPSE_COUNT);

  const categories = [
    { id: "all", name: "All Movies" },
    { id: "action", name: "Action" },
    { id: "horror", name: "Horror" },
    { id: "comedy", name: "Comedy" },
    { id: "adventure", name: "Adventure" },
  ];

  return (
    <div className="min-h-screen pt-20 bg-linear-to-b from-gray-900 to-black text-white">
      <section className="pt-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-6 py-3 rounded-full cursor-pointer transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4 pb-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {visibleMovies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movies/${movie.id}`}
                state={movie}
                className="group relative cursor-pointer"
              >
                <div className="overflow-hidden rounded-lg aspect-2/3">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                </div>

                <div className="mt-3 font-[pacifico]">
                  <h3 className="font-medium text-center truncate">
                    {movie.title}
                  </h3>

                  <div className="flex justify-center mt-1">
                    <span className="text-xs text-gray-400 capitalize">
                      {movie.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {filteredMovies.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12">
                No movies found in this category.
              </div>
            )}
          </div>

          {filteredMovies.length > COLLAPSE_COUNT && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="px-6 py-3 cursor-pointer rounded-full text-white border border-white/10 bg-linear-to-b from-purple-500 to-purple-700 transition"
              >
                {showAll
                  ? "Show Less"
                  : `Show More (${
                      filteredMovies.length - COLLAPSE_COUNT
                    } more)`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MoviesPage;
