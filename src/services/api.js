import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://borderbound-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Admin Auth APIs
export const adminLogin = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return response.data;
};

export const fetchAdminProfile = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

// Admin Dashboard & Management APIs
export const getDashboardStats = async () => {
  const response = await API.get("/admin/stats");
  return response.data.data;
};

export const getApplications = async (params = {}) => {
  const response = await API.get("/admin/applications", { params });
  return response.data.data;
};

export const reviewApplication = async (id, payload) => {
  const response = await API.patch(
    `/admin/applications/${id}/status`,
    payload
  );
  return response.data;
};

export const getPayments = async (params = {}) => {
  const response = await API.get("/admin/payments", { params });
  return response.data.data;
};

export const getVoteAuditLogs = async (params = {}) => {
  const response = await API.get("/admin/votes", { params });
  return response.data.data;
};

export const invalidateVotes = async (payload) => {
  const response = await API.post("/admin/votes/invalidate", payload);
  return response.data;
};

export const getFinalSelections = async () => {
  const response = await API.get("/admin/final-selections");
  return response.data.data;
};

export const selectWildcards = async (wildcardContestantIds) => {
  const response = await API.post("/admin/select-wildcards", {
    wildcardContestantIds,
  });
  return response.data;
};

export const certifyResults = async () => {
  const response = await API.post("/admin/certify-results");
  return response.data;
};

export const updateSystemConfig = async (config) => {
  const response = await API.put("/admin/config", config);
  return response.data;
};

export default API;