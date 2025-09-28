// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

// Pages
import AdminProductUpload from "./pages/AdminProductUpload";
import Products from "./pages/Products";

// Components
import ProductDetailPage from "./components/ProductDetailPage";

// Navigation Bar
function NavBar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Branding */}
      <Link to="/" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", textDecoration: "none" }}>
        Metier Parts
      </Link>

      {/* Navigation Links */}
      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/products" style={{ color: "#374151", textDecoration: "none", fontWeight: "500" }}>
          Products
        </Link>
        <Link to="/categories" style={{ color: "#374151", textDecoration: "none", fontWeight: "500" }}>
          Categories
        </Link>
        <Link to="/fitment" style={{ color: "#374151", textDecoration: "none", fontWeight: "500" }}>
          Fitment
        </Link>
        <Link to="/support" style={{ color: "#374151", textDecoration: "none", fontWeight: "500" }}>
          Support
        </Link>
      </div>

      {/* Icons (placeholder for now) */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>🔍</button>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>🛒</button>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>👤</button>
      </div>
    </nav>
  );
}

// Placeholder home page
function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 className="text-3xl font-bold mb-4">Welcome to Metier Parts</h1>
      <p>This is a placeholder Home page. Use the navigation above to explore.</p>
    </div>
  );
}

// Fallback 404
function NotFound() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Page Not Found</h2>
      <Link to="/" style={{ color: "blue" }}>
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminProductUpload />} />

        {/* Product catalog */}
        <Route path="/products" element={<Products />} />

        {/* Product detail */}
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Placeholder routes for now */}
        <Route path="/categories" element={<div style={{ padding: 40 }}>Categories page coming soon</div>} />
        <Route path="/fitment" element={<div style={{ padding: 40 }}>Fitment page coming soon</div>} />
        <Route path="/support" element={<div style={{ padding: 40 }}>Support page coming soon</div>} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
