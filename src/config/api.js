// Centralized API configuration
// Always points to the deployed Render backend URL in development and production,
// with support for VITE_API_URL environment variable override.
import axios from "axios";

export const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "https://hrms-server-1-hqgk.onrender.com"
).replace(/\/$/, "");

export const API_BASE_URL = BACKEND_URL;
export const API_URL = `${BACKEND_URL}/api`;

// Centralized Axios instance configured with the Render backend
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API_URL;
