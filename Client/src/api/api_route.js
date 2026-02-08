// CineGo / Client / src / api / api_route.js
const BASE_URL = import.meta.env.VITE_BASEURL;

const API_ROUTES = {
  USER: {
    USER_REGISTER: `${BASE_URL}/api/user/user-register`,
    USER_LOGIN: `${BASE_URL}/api/user/user-login`,
  },
};

export default API_ROUTES;
