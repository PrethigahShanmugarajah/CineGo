// CineGo / Client / src / components / Movies / Movies.jsx
import movies from "../../assets/dummymoviedata";
import { moviesStyles } from "../../assets/dummyStyles";
import { Link } from "react-router-dom";
import { Tickets } from "lucide-react";

const Movies = () => {
  const visibleMovies = movies.slice(0, 6);

  return (
    <section className={moviesStyles.container}>
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap")`}</style>

      <h2
        style={{ fontFamily: "'Dancing Script','cursive'" }}
        className="text-3xl sm:text-4xl md:text-5xl text-center mb-8"
      >
        Featured Movies
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
        {visibleMovies.map((m) => (
          <article key={m.id} className="flex flex-col items-center group">
            <Link
              to={`/movies/${m.id}`}
              className="flex flex-col items-center group"
            >
              <img
                src={m.img}
                alt={m.title}
                loading="lazy"
                className="w-full rounded-2xl object-cover h-70 sm:h-56 md:h-64 lg:h-56 xl:h-70"
              />
            </Link>

            <div className="mt-3 text-center w-full px-1">
              <div className="flex items-center justify-center gap-2">
                <Tickets className="h-4 w-4 text-purple-600" />
                <span
                  id={`movie-title-${m.id}`}
                  className="text-base sm:text-lg font-medium truncate"
                  style={{ fontFamily: "'Dancing Script','cursive'" }}
                >
                  {m.title}
                </span>
              </div>

              <div className="mt-1 font-[pacifico]">
                <span className="text-xs sm:text-sm text-gray-500 capitalize">
                  {m.category}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Movies;
