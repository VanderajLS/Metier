// metier-cx-app/frontend/src/services/mockApi.js
// Forward everything to the real API so App.jsx can keep using MockApiService.

import ApiService from "./api";

// Products
async function fetchProducts(params = {}) {
  return ApiService.fetchProducts(params);
}

async function fetchProductDetail(id) {
  return ApiService.fetchProductDetail(id);
}

async function fetchCategories() {
  // If/when you add a real categories endpoint, ApiService will handle it.
  return ApiService.fetchCategories();
}

// Cart (placeholders until real endpoints exist)
async function getCartCount()        { return ApiService.getCartCount(); }
async function getCart()             { return ApiService.getCart(); }
async function addToCart(id, qty=1)  { return ApiService.addToCart(id, qty); }
async function updateCartItem(i, q)  { return ApiService.updateCartItem(i, q); }
async function removeFromCart(i)     { return ApiService.removeFromCart(i); }
async function clearCart()           { return ApiService.clearCart(); }

const MockApiService = {
  fetchProducts,
  fetchProductDetail,
  fetchCategories,
  getCartCount,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default MockApiService;
