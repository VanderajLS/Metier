// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole, ROLES } from '../utils/auth';

// Component to protect routes based on authentication and roles
export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireRole = null,
  fallbackPath = "/" 
}) {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  // If authentication is required but user is not authenticated
  if (requireAuth && !authenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If specific role is required but user doesn't have it
  if (requireRole && userRole !== requireRole) {
    // If user is authenticated but doesn't have the right role
    if (authenticated) {
      // Redirect admin to admin page, customer to products
      const redirectPath = userRole === ROLES.ADMIN ? '/admin' : '/products';
      return <Navigate to={redirectPath} replace />;
    }
    // If not authenticated, redirect to landing
    return <Navigate to={fallbackPath} replace />;
  }

  // User has proper access, render the protected content
  return children;
}

// Specific components for common protection patterns
export function AdminRoute({ children }) {
  return (
    <ProtectedRoute requireAuth={true} requireRole={ROLES.ADMIN}>
      {children}
    </ProtectedRoute>
  );
}

export function CustomerRoute({ children }) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
}

// Component to show different content based on user role
export function RoleBasedContent({ adminContent, customerContent, guestContent }) {
  const userRole = getUserRole();
  const authenticated = isAuthenticated();

  if (!authenticated && guestContent) {
    return guestContent;
  }

  if (userRole === ROLES.ADMIN && adminContent) {
    return adminContent;
  }

  if (userRole === ROLES.CUSTOMER && customerContent) {
    return customerContent;
  }

  // Default fallback
  return guestContent || null;
}
