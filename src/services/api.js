import axios from "axios";

const API = axios.create({
  baseURL: "https://okemwabrian.pythonanywhere.com/api/",
});

// ✅ Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ HANDLE EXPIRED / INVALID TOKEN
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 🔥 Force logout
      localStorage.clear();
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default API;