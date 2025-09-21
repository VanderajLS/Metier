// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ComingSoon from "./pages/ComingSoon";
import AdminProductUpload from "./pages/AdminProductUpload"; // your admin page

// Simple gate: only allow access if session flag is present
function Protected({ children }) {
  const ok = typeof window !== "undefined" && sessionStorage.getItem("metier_auth") === "ok";
  return ok ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public placeholder */}
        <Route path="/" element={<ComingSoon />} />

        {/* Everything below is hidden behind the passcode */}
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminProductUpload />
            </Protected>
          }
        />

        {/* Add more protected routes here as needed, e.g.:
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
