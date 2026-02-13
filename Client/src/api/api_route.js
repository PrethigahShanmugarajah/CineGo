const BASE_URL = import.meta.env.VITE_BASEURL;

const API_ROUTES = {
  USER: {
    USER_REGISTER: `${BASE_URL}/api/user/user-register`,
    USER_LOGIN: `${BASE_URL}/api/user/user-login`,
  },
  MOVIE: {
    MOVIES_GET_RELEASE_SOON: `${BASE_URL}/api/movie/movies-get?type=releaseSoon&limit=100`,
    MOVIES_GET_FEATURED: `${BASE_URL}/api/movie/movies-get?type=featured&limt=100`,
    MOVIES_GET_NORMAL: `${BASE_URL}/api/movie/movies-get?type=normal&limit=200`,
    MOVIES_GET: `${BASE_URL}/api/movie/movies-get&limit=200`,
    MOVIES_GET_LATEST_TRAILER: `${BASE_URL}/api/movie/movies-get?type=latestTrailers&limit=50`,
    MOVIE_GET: (id) =>
      `${BASE_URL}/api/movie/movie-get/${encodeURIComponent(id)}`,
  },
  BOOKING: {
    BOOKING_GET: `${BASE_URL}/api/booking/booking-get`,
    BOOKING_GET_OCCUPIED: `${BASE_URL}/api/booking/booking-get-occupied`,
    BOOKING_CREATE: `${BASE_URL}/api/booking/booking-create`,
    BOOKING_CONFIRM_PAYMENT: `${BASE_URL}/api/booking/booking-confirm-payment`,
  },
};

export default API_ROUTES;
