// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

// Pages
import AdminProductUpload from "./pages/AdminProductUpload";
import Products from "./pages/Products";

// Components
import ProductDetailPage from "./components/ProductDetailPage";

// Simple home page (placeholder)
function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16, lineHeight: 1.5 }}>
      <h1 className="text-3xl font-bold mb-4">Metier CX</h1>
      <p className="mb-4">
        This is a placeholder Home page. Replace with your landing/catalog later.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/admin" className="text-blue-600 hover:underline">
            Admin Product Upload
          </Link>
        </li>
        <li>
          <Link to="/products" className="text-blue-600 hover:underline">
            View Products Catalog
          </Link>
        </li>
      </ul>
    </div>
  );
}

// Fallback 404 page
function NotFound() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h2 className="text-xl font-bold mb-2">Page not found</h2>
      <p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Admin upload page */}
        <Route path="/admin" element={<AdminProductUpload />} />

        {/* Product catalog (grid + modal) */}
        <Route path="/products" element={<Products />} />

        {/* Future: Product detail page */}
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
