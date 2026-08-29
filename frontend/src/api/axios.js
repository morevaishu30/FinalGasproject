import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const financialYear = localStorage.getItem("financialYear") || "2025-2026";
  if (financialYear) {
    config.headers["X-Financial-Year"] = financialYear;
  }
  return config;
});

export default api;
