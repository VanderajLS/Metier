// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import ComingSoon from "./pages/ComingSoon";
import AdminProductUpload from "./pages/AdminProductUpload";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail"; // Import the new ProductDetail component

// Components
import ProductDetailPage from "./components/ProductDetailPage";
import ProtectedRoute, { AdminRoute, CustomerRoute } from "./components/ProtectedRoute";

// Utils
import { isAuthenticated, getUserRole, ROLES } from "./utils/auth";

// Debug log
console.log("DEBUG: App.jsx loaded with role-based routing");

// Home component that redirects based on authentication
function Home() {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  // If not authenticated, show coming soon page
  if (!authenticated) {
    return <ComingSoon />;
  }

  // If authenticated, redirect based on role
  if (userRole === ROLES.ADMIN) {
    return <Navigate to="/admin" replace />;
  } else if (userRole === ROLES.CUSTOMER) {
    return <Navigate to="/products" replace />;
  }

  // Fallback to coming soon if role is unclear
  return <ComingSoon />;
}

// Enhanced Products page with role-based features
function EnhancedProducts() {
  return (
    <CustomerRoute>
      <Products />
    </CustomerRoute>
  );
}

// Enhanced Admin page with admin-only access
function EnhancedAdmin() {
  return (
    <AdminRoute>
      <AdminProductUpload />
    </AdminRoute>
  );
}

// 404 Not Found page
function NotFound() {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1e293b', 
          marginBottom: '16px' 
        }}>
          Page Not Found
        </h2>
        <p style={{ 
          color: '#64748b', 
          marginBottom: '24px' 
        }}>
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        
        {authenticated ? (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {userRole === ROLES.ADMIN && (
              <a 
                href="/admin" 
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Admin Dashboard
              </a>
            )}
            <a 
              href="/products" 
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              View Products
            </a>
          </div>
        ) : (
          <a 
            href="/" 
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Back to Home
          </a>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page - shows ComingSoon if not authenticated */}
        <Route path="/" element={<Home />} />
        
        {/* Admin routes - require admin role */}
        <Route path="/admin" element={<EnhancedAdmin />} />
        
        {/* Edit Product route - admin only */}
        <Route 
          path="/admin/edit/:productId" 
          element={
            <AdminRoute>
              <AdminProductUpload />
            </AdminRoute>
          } 
        />
        
        {/* Customer routes - require authentication (admin or customer) */}
        <Route path="/products" element={<EnhancedProducts />} />
        
        {/* NEW ROUTE: Product Detail page using our new component */}
        <Route 
          path="/products/:productId" 
          element={
            <CustomerRoute>
              <ProductDetail />
            </CustomerRoute>
          } 
        />
        
        {/* Future admin routes */}
        <Route 
          path="/admin/products" 
          element={
            <AdminRoute>
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Product Management</h2>
                <p>Coming soon - Edit and manage products</p>
              </div>
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/orders" 
          element={
            <AdminRoute>
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Order Management</h2>
                <p>Coming soon - View and manage customer orders</p>
              </div>
            </AdminRoute>
          } 
        />
        
        {/* Future customer routes */}
        <Route 
          path="/cart" 
          element={
            <CustomerRoute>
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Shopping Cart</h2>
                <p>Coming soon - Add products and create purchase orders</p>
              </div>
            </CustomerRoute>
          } 
        />
        
        {/* Catch all - 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
