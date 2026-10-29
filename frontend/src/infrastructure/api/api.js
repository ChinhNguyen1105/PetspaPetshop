
import axios from "axios";

// AXIOS INSTANCE
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://192.168.1.195:3000/api/v1",
  timeout: 15000,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("petspa_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Không ép FormData thành JSON.
    // Để Axios tự thiết lập multipart Content-Type và boundary.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data !== undefined) {
      if (config.headers.set) {
        config.headers.set(
          "Content-Type",
          "application/json"
        );
      } else {
        config.headers["Content-Type"] =
          "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "Token hết hạn hoặc không hợp lệ"
      );

      localStorage.removeItem("petspa_token");
      localStorage.removeItem("petspa_user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
