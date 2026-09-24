import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Payments from "./pages/Payments";
import VotesAudit from "./pages/VotesAudit";
import Selections from "./pages/Selections";
import SystemConfig from "./pages/SystemConfig";

// ===============================
// Auth Loading Screen
// ===============================
const AuthLoading = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl shadow-2xl">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Authenticating Admin Portal...</span>
      </div>
    </div>
  );
};

// ===============================
// Public Route
// ===============================
// Login public hai.
// Agar already logged in hai toh login page par nahi jaane denge.
const PublicRoute = () => {
  const { admin, token, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (token || admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// ===============================
// Protected Route
// ===============================
const ProtectedRoute = () => {
  const { admin, token, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!token && !admin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

// ===============================
// App
// ===============================
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* ================= PROTECTED ROUTES ================= */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/votes" element={<VotesAudit />} />
            <Route path="/selections" element={<Selections />} />
            <Route path="/config" element={<SystemConfig />} />
          </Route>

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;