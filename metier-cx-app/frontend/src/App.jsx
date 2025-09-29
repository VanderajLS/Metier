import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import AdminProductUpload from "./pages/AdminProductUpload";
import ComingSoon from "./pages/ComingSoon";
import ProductDetail from "./pages/ProductDetail"; // Import the new ProductDetail component
import { getUserRole, isAuthenticated, isAdmin, ROLES } from "./utils/auth";

// Protected route for admin-only access
const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/products" replace />;
  }
  
  return children;
};

// Protected route for any authenticated user
const ProtectedRoute = ({ children, requireRole }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  if (requireRole && getUserRole() !== requireRole) {
    // Redirect admin to admin page, customers to products
    if (isAdmin()) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/products" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing/Auth page - accessible to everyone */}
        <Route path="/" element={<ComingSoon />} />
        
        {/* Products page - accessible to authenticated users */}
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } 
        />
        
        {/* NEW ROUTE: Product Detail page */}
        <Route 
          path="/products/:productId" 
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Upload page - admin only */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminProductUpload />
            </AdminRoute>
          } 
        />
        
        {/* Edit Product page - admin only */}
        <Route 
          path="/admin/edit/:productId" 
          element={
            <AdminRoute>
              <AdminProductUpload />
            </AdminRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
