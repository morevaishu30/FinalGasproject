import axios from "axios";

export const getApiBaseUrl = () => {
  // 1. Check if user configured a custom backend URL in browser localStorage
  const savedUrl = localStorage.getItem("VITE_API_URL") || localStorage.getItem("API_URL");
  if (savedUrl && savedUrl.trim()) {
    return savedUrl.trim().replace(/\/+$/, '');
  }

  // 2. Check build-time Vite environment variable
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
  }

  // 3. Fallback
  return "http://localhost:8080/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60s timeout to allow Render free tier cold-start wake-up
});

api.interceptors.request.use((config) => {
  // Dynamically resolve base URL on each request in case it was updated in settings
  config.baseURL = getApiBaseUrl();

  const financialYear = localStorage.getItem("financialYear") || "2025-2026";
  if (financialYear) {
    config.headers["X-Financial-Year"] = financialYear;
  }
  return config;
});

export default api;
