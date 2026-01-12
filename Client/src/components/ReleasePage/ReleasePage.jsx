// CineGo / Client / src / components / ReleasePage / ReleasePage.jsx
import movies from "../../assets/dummyrdata";

const ReleasePage = () => {
  return (
    <div className="min-h-screen pt-25 bg-linear-to-br from-gray-900 to-black text-white p-6">
      <div className="text-center mb-12 mt-6">
        <h1 className="font-bold text-5xl md:text-6xl bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-purple-600 to-pink-500 font-[pacifico]">
          Releases Soon
        </h1>

        <p className="mt-4 text-xl text-gray-300">
          Latest Movies • Now Showing
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="group relative transition-all duration-500 hover:z-10"
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-72 object-cover transition-transform duration-700"
              />
            </div>

            <div className="mt-3 font-[pacifico] text-center">
              <h3 className="font-semibold text-lg truncate">{movie.title}</h3>

              <p className="text-sm text-gray-400 mt-1">{movie.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleasePage;
