import axios from "axios";
import env from "../config/env";

const API_URL = env.API_URL;

// Create instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies
});

// Store access token in memory and localStorage
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
};

// Request interceptor (attach token)
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor (handle refresh)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("api/auth/login/") &&
      !originalRequest.url.includes("api/auth/token/refresh/")
    ) {
      try {
        const res = await axiosInstance.post(
          `api/auth/token/refresh/`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.access;

        setAccessToken(newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
