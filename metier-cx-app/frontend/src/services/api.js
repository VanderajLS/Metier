// frontend/src/services/api.js
// Minimal, resilient API client wired to your live backend.
// If you later set Vercel env var VITE_API_BASE_URL, this will use it automatically.

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.trim() ||
  "https://metier-backend-metier-back-end-new.up.railway.app";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Try to parse JSON; if not JSON, throw a readable error
  const text = await res.text();
  let data;
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

// --- Public API ---
// Use both names so your UI won’t break regardless of how it was wired.
export async function listProducts() {
  // Backend fallback route we just verified
  return request("/api/products");
}
export async function getProducts() {
  return listProducts();
}

// Optional helpers (no-ops for now so the app won’t crash if they’re called)
export async function getProduct(id) {
  // If/when you add /api/products/:id on the backend, switch to: return request(`/api/products/${id}`);
  const all = await listProducts();
  return all.find((p) => String(p.id) === String(id)) || null;
}
export async function searchProducts(q = "") {
  const all = await listProducts();
  const ql = q.toLowerCase();
  return all.filter((p) =>
    Object.values(p).join(" ").toLowerCase().includes(ql)
  );
}

const ApiService = {
  listProducts,
  getProducts,
  getProduct,
  searchProducts,
};

export default ApiService;
