import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("API URL:", import.meta.env.VITE_API_URL);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    console.log("STATUS:", status);
    console.log("URL:", error.config?.url);
    console.log("MESSAGE:", error.response?.data);

    // only logout on REAL auth failure
    if (status === 401 || status === 403) {
      const msg = error.response?.data?.message;

      if (msg === "Not authorized" || msg === "Invalid token") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
export default axiosInstance;
