// frontend/src/services/api.js
// Live API base for Metier frontend → Railway backend.
// If you later set a Vercel env var VITE_API_BASE_URL, this will use it automatically.

const API_BASE =
  (import.meta?.env?.VITE_API_BASE_URL || "").trim() ||
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

  const bodyText = await res.text();
  let data = null;
  try {
    data = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    throw new Error(`Non-JSON response ${res.status}: ${bodyText?.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    throw new Error(msg || `Request failed ${res.status}`);
  }
  return data;
}

// Public API the UI can call
export async function listProducts() {
  return request("/api/products");
}
export async function getProducts() {
  return listProducts();
}
export async function getProduct(id) {
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

const ApiService = { listProducts, getProducts, getProduct, searchProducts };
export default ApiService;
