// src/utils/auth.js
// Authentication utilities for role-based access control

export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer'
};

// Check if user is authenticated
export function isAuthenticated() {
  return sessionStorage.getItem("metier_auth") === "authenticated";
}

// Get current user role
export function getUserRole() {
  if (!isAuthenticated()) return null;
  return sessionStorage.getItem("metier_role");
}

// Check if user has admin role
export function isAdmin() {
  return getUserRole() === ROLES.ADMIN;
}

// Check if user has customer role
export function isCustomer() {
  return getUserRole() === ROLES.CUSTOMER;
}

// Check if user has specific role
export function hasRole(role) {
  return getUserRole() === role;
}

// Logout user
export function logout() {
  sessionStorage.removeItem("metier_auth");
  sessionStorage.removeItem("metier_role");
  window.location.href = "/"; // Redirect to landing page
}

// Get user display name based on role
export function getUserDisplayName() {
  const role = getUserRole();
  if (role === ROLES.ADMIN) return "Admin";
  if (role === ROLES.CUSTOMER) return "Customer";
  return "Guest";
}

// Check if user can access admin features
export function canAccessAdmin() {
  return isAdmin();
}

// Check if user can access customer features
export function canAccessCustomer() {
  return isAuthenticated(); // Both admin and customer can access customer features
}

// Route permissions
export const ROUTE_PERMISSIONS = {
  '/': 'public',           // Landing page - everyone
  '/products': 'customer', // Products - customers and admins
  '/admin': 'admin',       // Admin upload - admin only
  '/admin/*': 'admin',     // All admin routes - admin only
  '/orders': 'admin',      // Order management - admin only
  '/cart': 'customer',     // Shopping cart - customers and admins
  '/checkout': 'customer'  // Checkout - customers and admins
};

// Check if user can access a specific route
export function canAccessRoute(path) {
  const permission = ROUTE_PERMISSIONS[path] || 'public';
  
  switch (permission) {
    case 'public':
      return true;
    case 'customer':
      return canAccessCustomer();
    case 'admin':
      return canAccessAdmin();
    default:
      return false;
  }
}
