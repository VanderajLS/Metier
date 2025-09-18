// metier-cx-app/frontend/src/services/adminApi.js
// Admin-only API calls (create, upload, AI describe). Uses the same base rule as the site.

const API_BASE =
  (import.meta?.env?.VITE_API_BASE_URL || "").trim() ||
  "https://metier-backend-metier-back-end-new.up.railway.app";

// JSON helper
async function jsonReq(path, body, method = "POST") {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* noop */ }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || text || res.statusText;
    throw new Error(msg);
  }
  return data;
}

// multipart helper
async function formReq(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* noop */ }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || text || res.statusText;
    throw new Error(msg);
  }
  return data;
}

// ---- Admin endpoints ----
export function aiDescribe({ name, sku, category, price, image_url, specs }) {
  return jsonReq(`/api/admin/ai/describe`, { name, sku, category, price, image_url, specs });
}

export function createProductJson({ name, sku, category, price, image_url, description, specs }) {
  return jsonReq(`/api/admin/products`, { name, sku, category, price, image_url, description, specs });
}

export function uploadProductWithImage({ name, sku, category, price, description, specs, file }) {
  const fd = new FormData();
  fd.append("name", name || "");
  if (sku)       fd.append("sku", sku);
  if (category)  fd.append("category", category);
  if (price != null) fd.append("price", String(price));
  if (description) fd.append("description", description);
  if (specs)       fd.append("specs", specs);
  if (file)        fd.append("image", file);
  return formReq(`/api/admin/products/upload`, fd);
}
