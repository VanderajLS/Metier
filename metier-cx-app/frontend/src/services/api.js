// frontend/src/services/api.js
// Uses Vercel env var if set, otherwise your Railway URL.
const API_BASE =
  (import.meta?.env?.VITE_API_BASE_URL || "").trim() ||
  "https://metier-backend-metier-back-end-new.up.railway.app";

// Helper
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response ${res.status}: ${text?.slice(0, 200)}`);
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    throw new Error(msg || `Request failed ${res.status}`);
  }
  return data;
}

// ---- Methods expected by the app (match Mock API shape) ----

// Products
async function fetchProducts(params = {}) {
  // Your backend returns a raw array []; wrap it to {products: []} for the UI.
  const query = new URLSearchParams(params).toString();
  const list = await request(`/api/products${query ? `?${query}` : ""}`);
  return { products: Array.isArray(list) ? list : [] };
}

async function fetchProductDetail(id) {
  // If you later add /api/products/:id on backend, switch to that.
  const list = await request(`/api/products`);
  const item = (Array.isArray(list) ? list : []).find((p) => String(p.id) === String(id));
  if (!item) throw new Error("Product not found");
  return item;
}

async function fetchCategories() {
  // Backend doesn’t expose categories yet — return empty list to keep UI happy.
  return { categories: [] };
}

// Cart (no real endpoints yet — return safe placeholders)
async function getCartCount()        { return { count: 0 }; }
async function getCart()             { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function addToCart()           { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function updateCartItem()      { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function removeFromCart()      { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function clearCart()           { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }

// Export an object shaped like the Mock service so the rest of the app keeps working.
const ApiService = {
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

export default ApiService;
