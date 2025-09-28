// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ComingSoon from "./pages/ComingSoon";
import AdminProductUpload from "./pages/AdminProductUpload";
import Products from "./pages/Products"; // ✅ new import

// Simple gate: only allow access if session flag is present
function Protected({ children }) {
  const ok =
    typeof window !== "undefined" &&
    sessionStorage.getItem("metier_auth") === "ok";
  return ok ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ComingSoon />} />
        <Route path="/products" element={<Products />} /> {/* ✅ new route */}

        {/* Protected admin route */}
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminProductUpload />
            </Protected>
          }
        />

        {/* Fallback: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
