import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
export const API_UPLOADS_URL =
  import.meta.env.VITE_API_UPLOADS_URL || "http://localhost:8080/";

if (import.meta.env.DEV) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is not defined in environment variables");
  }
  if (!import.meta.env.VITE_API_UPLOADS_URL) {
    console.warn(
      "VITE_API_UPLOADS_URL is not defined in environment variables"
    );
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("cashier");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
