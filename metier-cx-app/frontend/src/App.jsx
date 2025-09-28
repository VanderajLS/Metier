// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

// Pages
import AdminProductUpload from "./pages/AdminProductUpload";
import Products from "./pages/Products";

// Components
import ProductDetailPage from "./components/ProductDetailPage";

// Debug log
console.log("DEBUG: App.jsx loaded. Products import is:", Products);

function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 className="text-3xl font-bold mb-4">Metier CX</h1>
      <p>This is a placeholder Home page.</p>
      <ul>
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

function NotFound() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Page Not Found</h2>
      <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminProductUpload />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
