// CineGo / Admin / src / api / api_route.js
const BASE_URL = import.meta.env.VITE_BASEURL;

const API_ROUTES = {
  MOVIE: {
    MOVIE_CREATE: `${BASE_URL}/api/movie/movie-create`,
    MOVIE_GET: `${BASE_URL}/api/movie/movies-get`,
    MOVIE_DELETE: (targetId) =>
      `${BASE_URL}/api/movie/movie-delete/${targetId}`,
  },
  BOOKING: {
    BOOKING_LIST: `${BASE_URL}/api/booking/booking-list`,
    BOOKING_GET: `${BASE_URL}/api/booking/booking-get`,
  },
  USER: {
    USER_GET: `${BASE_URL}/api/user/user-get`,
  },
};

export default API_ROUTES;
