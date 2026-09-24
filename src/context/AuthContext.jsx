import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  adminLogin as apiLogin,
  fetchAdminProfile,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("admin_token");
  });

  const [loading, setLoading] = useState(true);

  // ===============================
  // Initialize Authentication
  // ===============================
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("admin_token");

      // No token
      if (!storedToken) {
        setToken(null);
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetchAdminProfile();

        const user = response?.user;

        if (user?.role === "admin") {
          setToken(storedToken);
          setAdmin(user);
        } else {
          // Don't immediately remove token here
          setAdmin(null);
        }
      } catch (error) {
        console.error("Admin authentication failed:", error);

        // IMPORTANT:
        // Don't remove token automatically on every error.
        // Only clear it when backend explicitly says 401.
        if (error?.response?.status === 401) {
          localStorage.removeItem("admin_token");
          setToken(null);
          setAdmin(null);
        } else {
          // Network/server error
          // Keep existing token
          setToken(storedToken);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ===============================
  // Login
  // ===============================
  const login = async (email, password) => {
    const response = await apiLogin({
      email,
      password,
    });

    const newToken = response?.data?.token;
    const user = response?.data?.user;

    if (!newToken) {
      throw new Error("Login token not received");
    }

    if (user?.role !== "admin") {
      throw new Error("This account does not have admin access");
    }

    // Save token
    localStorage.setItem("admin_token", newToken);

    // Update state
    setToken(newToken);
    setAdmin(user);

    return response;
  };

  // ===============================
  // Logout
  // ===============================
  const logout = () => {
    localStorage.removeItem("admin_token");

    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===============================
// Hook
// ===============================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};