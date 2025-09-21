// src/services/adminApi.js
const API_BASE =
  (import.meta?.env?.VITE_API_BASE_URL || "").trim() ||
  "https://api.metierturbo.com";

// Helper to make JSON requests
async function jsonReq(path, body, method = "POST") {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) throw new Error((data && (data.message || data.error)) || text || res.statusText);
  return data;
}

// Helper for multipart (legacy proxy upload)
async function formReq(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) throw new Error((data && (data.message || data.error)) || text || res.statusText);
  return data;
}

// ----- Endpoints your admin page calls -----
export function aiDescribe(payload) {
  return jsonReq(`/api/admin/ai/describe`, payload);
}

export function createProductJson(payload) {
  return jsonReq(`/api/admin/products`, payload);
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
