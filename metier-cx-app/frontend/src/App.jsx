// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Admin page (the uploader you added)
import AdminProductUpload from "./pages/AdminProductUpload";

// Minimal, built-in Home so the app never shows a blank screen
function Home() {
  return (
    <div style={{maxWidth: 900, margin: "40px auto", padding: 16, lineHeight: 1.5}}>
      <h1>Metier CX</h1>
      <p>This is a placeholder Home page to keep the site visible while we wire routes.</p>
      <ul>
        <li>
          <Link to="/admin">Go to Admin Product Upload</Link>
        </li>
        <li>
          <a href="/catalog">Open Catalog (if your project has this route)</a>
        </li>
      </ul>
      <p style={{color:"#666", fontSize:13}}>
        When you’re ready, replace this Home with your real landing/catalog routes.
      </p>
    </div>
  );
}

// Optional “Not Found” page
function NotFound() {
  return (
    <div style={{maxWidth: 900, margin: "40px auto", padding: 16}}>
      <h2>Page not found</h2>
      <p><Link to="/">Back to Home</Link></p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Always render a real Home so "/" works */}
        <Route path="/" element={<Home />} />

        {/* Admin upload page (live) */}
        <Route path="/admin" element={<AdminProductUpload />} />

        {/* If you already have real pages, add them here:
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            etc.
        */}

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
