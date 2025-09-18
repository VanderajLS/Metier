// metier-cx-app/frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ⬇️ NEW: admin page you added earlier
import AdminProductUpload from "./pages/AdminProductUpload";

// ⬇️ OPTIONAL: if you have a layout you want to wrap pages in
// import Layout from "./components/Layout";

// ⬇️ IMPORTANT:
// Put your existing page imports back here (Home, Product, Category, etc.)
// Example:
// import Home from "./pages/Home";
// import ProductPage from "./pages/ProductPage";
// import CatalogPage from "./pages/CatalogPage";

export default function App() {
  return (
    <Router>
      {/* If you have a Layout, wrap <Routes> in it
          <Layout> ... </Layout> */}
      <Routes>
        {/* ---------- YOUR EXISTING ROUTES (paste them here) ----------
            Example:
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            --------------------------------------------------------- */}

        {/* NEW: Admin upload page (live now) */}
        <Route path="/admin" element={<AdminProductUpload />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
