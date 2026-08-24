import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: `/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = res.data;
          Cookies.set("access_token", access_token, { expires: 1 });
          Cookies.set("refresh_token", refresh_token, { expires: 30 });
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api(error.config);
        } catch {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  refresh: (refresh_token: string) =>
    api.post("/auth/refresh", { refresh_token }),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, new_password: string) =>
    api.post("/auth/reset-password", { token, new_password }),
};

export const userApi = {
  me: () => api.get("/me"),
  updateMe: (data: { full_name?: string; email?: string }) =>
    api.put("/me", data),
  getPreferences: () => api.get("/preferences"),
  updatePreferences: (data: object) => api.put("/preferences", data),
  completeOnboarding: (data: object) => api.post("/onboarding", data),
  stats: () => api.get("/stats"),
  changePassword: (current_password: string, new_password: string) =>
    api.post("/change-password", { current_password, new_password }),
};

export const briefingApi = {
  today: () => api.get("/briefings/today"),
  list: (page = 1) => api.get(`/briefings?page=${page}`),
  get: (id: string) => api.get(`/briefings/${id}`),
};

export const articleApi = {
  list: (params?: { page?: number; category?: string; search?: string }) =>
    api.get("/articles", { params }),
  get: (id: string) => api.get(`/articles/${id}`),
  save: (id: string) => api.post(`/articles/${id}/save`),
  unsave: (id: string) => api.delete(`/articles/${id}/save`),
  savedList: () => api.get("/articles/saved/list"),
};

export const learningApi = {
  topics: () => api.get("/learning/topics"),
  progress: () => api.get("/learning/progress"),
  start: (id: string) => api.post(`/learning/${id}/start`),
  complete: (id: string) => api.post(`/learning/${id}/complete`),
};

export const adminApi = {
  stats: () => api.get("/admin/stats"),
  sources: () => api.get("/admin/sources"),
  triggerIngestion: () => api.post("/admin/ingestion/trigger"),
  triggerBriefing: () => api.post("/briefings/generate"),
};
