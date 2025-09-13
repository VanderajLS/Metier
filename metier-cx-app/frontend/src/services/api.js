// metier-cx-app/frontend/src/services/api.js
// Uses Vercel env if set, else your live Railway URL.
const API_BASE =
  (import.meta?.env?.VITE_API_BASE_URL || "").trim() ||
  "https://metier-backend-metier-back-end-new.up.railway.app";

// helper
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {
    throw new Error(`Non-JSON response ${res.status}: ${text?.slice(0,200)}`);
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    throw new Error(msg || `Request failed ${res.status}`);
  }
  return data;
}

// ---- API expected by the app (normalize shapes to {products: []}, {categories: []}) ----
async function fetchProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const payload = await request(`/api/products${qs ? `?${qs}` : ""}`);
  // Backend may return an array [] (fallback) or {products:[...]} — normalize
  const list = Array.isArray(payload) ? payload : (payload?.products ?? []);
  return { products: list };
}

async function fetchProductDetail(id) {
  // If /api/products/:id doesn’t exist yet, derive from list:
  const { products } = await fetchProducts();
  const found = products.find(p => String(p.id) === String(id));
  if (!found) throw new Error("Product not found");
  return found;
}

async function fetchCategories() {
  // No categories endpoint yet — return empty safely
  return { categories: [] };
}

// Cart placeholders (so UI won’t crash)
async function getCartCount()   { return { count: 0 }; }
async function getCart()        { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function addToCart()      { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function updateCartItem() { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function removeFromCart() { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }
async function clearCart()      { return { cart: { items: [], total_items: 0, total_amount: 0 } }; }

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
