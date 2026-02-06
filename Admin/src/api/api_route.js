// CineGo / Admin / src / api / api_route.js
const BASE_URL = import.meta.env.VITE_BASEURL;

const API_ROUTES = {
  MOVIE: {
    MOVIE_CREATE: `${BASE_URL}/api/movie/movie-create`,
    MOVIE_GET: `${BASE_URL}/api/movie/movies-get`,
    MOVIE_DELETE: (targetId) =>
      `${BASE_URL}/api/movie/movie-delete/${targetId}`,
  },
};

export default API_ROUTES;
