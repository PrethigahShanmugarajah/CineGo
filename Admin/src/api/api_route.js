// CineGo / Admin / src / api / api_route.js
const BASE_URL = import.meta.env.VITE_BASEURL;

const API_ROUTES = {
  MOVIE: {
    MOVIE_CREATE: `${BASE_URL}/api/movie/movie-create`,
  },
};

export default API_ROUTES;
