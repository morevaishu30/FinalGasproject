import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const financialYear = localStorage.getItem("financialYear");
  if (financialYear) {
    config.headers["X-Financial-Year"] = financialYear;
  }
  return config;
});

export default api;
