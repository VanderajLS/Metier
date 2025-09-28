// metier-cx-app/frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Pages
import AdminProductUpload from "./pages/AdminProductUpload";
import Products from "./pages/Products";

// Minimal Home page until you add a real landing/catalog
function Home() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 16,
        lineHeight: 1.5,
      }}
    >
      <h1 className="text-3xl font-bold mb-4">Metier CX</h1>
      <p className="mb-4">
        This is a placeholder Home page to keep the site visible while we wire
        routes.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/admin" className="text-blue-600 hover:underline">
            Go to Admin Product Upload
          </Link>
        </li>
        <li>
          <Link to="/products" className="text-blue-600 hover:underline">
            View Products Catalog
          </Link>
        </li>
      </ul>
      <p style={{ color: "#666", fontSize: 13, marginTop: 20 }}>
        When you’re ready, replace this Home with your real landing or catalog
        route.
      </p>
    </div>
  );
}

// Fallback Not Found page
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
        {/* Home route */}
        <Route path="/" element={<Home />} />

        {/* Admin product upload page */}
        <Route path="/admin" element={<AdminProductUpload />} />

        {/* Product catalog (new grid + modal) */}
        <Route path="/products" element={<Products />} />

        {/* Later you can add product detail pages here, e.g.:
            <Route path="/products/:id" element={<ProductDetailPage />} /> */}

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
