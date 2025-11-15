import axios from "axios";
const api = axios.create({
  baseURL: "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1",
  timeout: 60000, // 60 seconds
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
