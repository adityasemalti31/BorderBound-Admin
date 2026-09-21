
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  adminLogin as apiLogin,
  fetchAdminProfile,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("admin_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchAdminProfile();

        if (response?.user?.role === "admin") {
          setAdmin(response.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Admin authentication failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin({
      email,
      password,
    });

    const token = response?.data?.token;
    const user = response?.data?.user;

    if (!token) {
      throw new Error("Login token not received");
    }

    if (user?.role !== "admin") {
      throw new Error("This account does not have admin access");
    }

    localStorage.setItem("admin_token", token);

    setToken(token);
    setAdmin(user);

    return response;
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
