// CineGo / Client / src / api / api_route.js
const BASE_URL = import.meta.env.VITE_BASEURL;

const API_ROUTES = {
  USER: {
    USER_REGISTER: `${BASE_URL}/api/user/user-register`,
    USER_LOGIN: `${BASE_URL}/api/user/user-login`,
  },
  MOVIE: {
    MOVIE_GET_RELEASE_SOON: `${BASE_URL}/api/movie/movies-get?type=releaseSoon&limit=100`,
    MOVIE_GET_FEATURED: `${BASE_URL}/api/movie/movies-get?type=featured&limt=6`,
    MOVIE_GET_NORMAL: `${BASE_URL}/api/movie/movies-get?type=normal&limit=200`,
    MOVIE_GET: `${BASE_URL}/api/movie/movies-get&limit=200`,
    MOVIE_GET_LATEST_TRAILER: `${BASE_URL}/api/movie/movies-get?type=latestTrailers&limit=50`,
  },
};

export default API_ROUTES;
