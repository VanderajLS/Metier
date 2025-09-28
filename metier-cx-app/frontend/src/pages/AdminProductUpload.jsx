// src/pages/AdminProductUpload.jsx
import React, { useState } from "react";

export default function AdminProductUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fields, setFields] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    specs: "",
    description: "",
    image_url: ""
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  async function handleUpload() {
    if (!file) return;

    try {
      setBusy(true);
      setMsg("Requesting presign...");

      // Step 1: get presign
      const res = await fetch(`${API_BASE}/api/admin/images/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder: "products/test"
        }),
      });
      const { url, fields: s3Fields, public_url } = await res.json();

      // Step 2: upload to R2
      const formData = new FormData();
      Object.entries(s3Fields).forEach(([k, v]) => formData.append(k, v));
      formData.append("file", file);

      const uploadRes = await fetch(url, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");

      setPreview(public_url);
      setFields(f => ({ ...f, image_url: public_url }));
      setMsg("Image uploaded!");
    } catch (e) {
      setMsg(`Upload error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDescribe() {
    try {
      setBusy(true);
      setMsg("Generating description with AI...");
      const res = await fetch(`${API_BASE}/api/admin/ai/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (data.description) {
        setFields(f => ({ ...f, description: data.description }));
      }
      setMsg("AI description generated.");
    } catch (e) {
      setMsg(`AI error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!fields.name.trim()) return setMsg("Name is required.");
    try {
      setBusy(true);
      setMsg("Saving product...");
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg("Product saved! Check your catalog.");
      setFields({ name: "", sku: "", category: "", price: "", specs: "", description: "", image_url: "" });
      setFile(null);
      setPreview("");
    } catch (e) {
      setMsg(`Save error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Admin: Upload Product</h1>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <label>
          Name*<br/>
          <input value={fields.name} onChange={e=>setFields(f=>({...f, name:e.target.value}))} required />
        </label>
        <label>
          SKU<br/>
          <input value={fields.sku} onChange={e=>setFields(f=>({...f, sku:e.target.value}))} />
        </label>
        <label>
          Category<br/>
          <input value={fields.category} onChange={e=>setFields(f=>({...f, category:e.target.value}))} />
        </label>
        <label>
          Price<br/>
          <input type="number" step="0.01" value={fields.price}
            onChange={e=>setFields(f=>({...f, price:e.target.value}))} />
        </label>
        <label>
          Specs/Notes<br/>
          <textarea value={fields.specs} onChange={e=>setFields(f=>({...f, specs:e.target.value}))} rows={3}/>
        </label>

        <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
          <legend>Image</legend>
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <button type="button" onClick={handleUpload} disabled={!file || busy}>
            {busy ? "Uploading..." : "Upload to R2"}
          </button>
        </fieldset>

        {preview && (
          <>
            <h4>Preview:</h4>
            <img src={preview} alt="preview" style={{ maxWidth: "100%" }} />
          </>
        )}

        <label>
          Description<br/>
          <textarea value={fields.description} onChange={e=>setFields(f=>({...f, description:e.target.value}))} rows={6}/>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={handleDescribe} disabled={busy || !fields.image_url}>
            {busy ? "Working..." : "Generate with AI"}
          </button>
          <button type="submit" disabled={busy || !fields.name.trim()}>Save Product</button>
        </div>

        {msg && <div style={{ padding: 8, background: "#f7f7f7", border: "1px solid #eee" }}>{msg}</div>}
      </form>
    </div>
  );
}
