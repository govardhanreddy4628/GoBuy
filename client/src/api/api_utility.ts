// services/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

//Config
const BASE_URL = import.meta.env.VITE_BACKEND_URL_LOCAL || "http://localhost:5000";

//In-memory access token
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;


// Axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // refresh cookie
  timeout: 10000,
});

// Refresh lock
let refreshPromise: Promise<string> | null = null;


// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 🛑 IMPORTANT GUARD (ADD THIS HERE)
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .get("/api/v1/user/auth/refresh")
          .then((res) => {
            const newToken = res.data?.accessToken;
            if (!newToken) throw new Error("No access token");
            setAccessToken(newToken);
            return newToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers ?? {};
      (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (err) {
      setAccessToken(null);
      return Promise.reject(err);
    }
  }
);


export default api;

/* ======================
   Optional helpers
====================== */

export const GET = <T = any>(
  url: string,
  config?: AxiosRequestConfig
) => api.get<T>(url, config);

export const POST = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => api.post<T>(url, data, config);

export const PUT = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => api.put<T>(url, data, config);

export const DELETE = <T = any>(
  url: string,
  config?: AxiosRequestConfig
) => api.delete<T>(url, config);
