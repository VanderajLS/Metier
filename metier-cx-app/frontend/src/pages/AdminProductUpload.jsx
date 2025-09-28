import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminProductUpload() {
  const [infoFile, setInfoFile] = useState(null);
  const [productFiles, setProductFiles] = useState([]);
  const [previewInfo, setPreviewInfo] = useState("");
  const [previewProducts, setPreviewProducts] = useState([]);
  const [fields, setFields] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    inventory: "",
    specs: "",
    description: "",
    image_url: ""
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  // --- Helpers ---
  async function presignAndUpload(file, folder) {
    const presignRes = await fetch(`${API_BASE}/api/admin/images/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        folder,
      }),
    });
    if (!presignRes.ok) throw new Error("Presign request failed");
    const { upload_url, public_url } = await presignRes.json();

    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");

    return public_url;
  }

  // --- Upload description image ---
  async function handleInfoUpload() {
    if (!infoFile) return;
    try {
      setBusy(true);
      setMsg("Uploading description image...");
      const url = await presignAndUpload(infoFile, "products/info");
      setPreviewInfo(url);
      setFields((f) => ({ ...f, image_url: url }));
      setMsg("Description image uploaded!");
    } catch (e) {
      setMsg(`Info upload error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // --- Upload product gallery images ---
  async function handleProductUploads() {
    if (!productFiles.length) return;
    try {
      setBusy(true);
      setMsg("Uploading product images...");
      const urls = [];
      for (const file of productFiles) {
        const url = await presignAndUpload(file, "products/images");
        urls.push(url);
      }
      setPreviewProducts(urls);
      setMsg("Product images uploaded!");
    } catch (e) {
      setMsg(`Product images error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // --- Generate fields with AI ---
  async function handleDescribe() {
    if (!fields.image_url) {
      setMsg("Upload a description image first.");
      return;
    }
    try {
      setBusy(true);
      setMsg("Generating product details with AI...");
      const res = await fetch(`${API_BASE}/api/admin/ai/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: fields.image_url,
          price: fields.price,
          inventory: fields.inventory,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.message || "AI error");
      setFields((f) => ({
        ...f,
        name: data.name || f.name,
        category: data.category || f.category,
        sku: data.sku || f.sku,
        specs: data.specs || f.specs,
        description: data.description || f.description,
        price: data.price || f.price,
        inventory: data.inventory || f.inventory,
      }));
      setMsg("AI description generated.");
    } catch (e) {
      setMsg(`AI error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // --- Save product ---
  async function handleSave(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setMsg("Saving product...");
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          product_images: previewProducts,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg("Product saved! Check the catalog.");
      setFields({
        name: "",
        sku: "",
        category: "",
        price: "",
        inventory: "",
        specs: "",
        description: "",
        image_url: "",
      });
      setInfoFile(null);
      setProductFiles([]);
      setPreviewInfo("");
      setPreviewProducts([]);
    } catch (e) {
      setMsg(`Save error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // --- UI ---
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/products" style={{ marginRight: 12 }}>View Products</Link>
        <Link to="/admin">Admin Upload</Link>
      </nav>

      <h1>Admin: Upload Product</h1>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
          <legend>Description Image</legend>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setInfoFile(e.target.files?.[0] || null)}
          />
          <button type="button" onClick={handleInfoUpload} disabled={!infoFile || busy}>
            {busy ? "Uploading..." : "Upload Info Image"}
          </button>
          {previewInfo && (
            <img
              src={previewInfo}
              alt="info preview"
              style={{ maxWidth: "100%", marginTop: 10 }}
            />
          )}
        </fieldset>

        <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
          <legend>Product Images</legend>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setProductFiles(Array.from(e.target.files || []))}
          />
          <button
            type="button"
            onClick={handleProductUploads}
            disabled={!productFiles.length || busy}
          >
            {busy ? "Uploading..." : "Upload Product Images"}
          </button>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {previewProducts.map((url, i) => (
              <img key={i} src={url} alt="prod preview" style={{ width: 120 }} />
            ))}
          </div>
        </fieldset>

        <label>
          Price<br />
          <input
            type="number"
            step="0.01"
            value={fields.price}
            onChange={(e) => setFields((f) => ({ ...f, price: e.target.value }))}
          />
        </label>

        <label>
          Inventory<br />
          <input
            type="number"
            value={fields.inventory}
            onChange={(e) => setFields((f) => ({ ...f, inventory: e.target.value }))}
          />
        </label>

        <button
          type="button"
          onClick={handleDescribe}
          disabled={busy || !fields.image_url}
        >
          {busy ? "Working..." : "Generate with AI"}
        </button>

        <label>
          Name<br />
          <input
            value={fields.name}
            onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
          />
        </label>

        <label>
          SKU<br />
          <input
            value={fields.sku}
            onChange={(e) => setFields((f) => ({ ...f, sku: e.target.value }))}
          />
        </label>

        <label>
          Category<br />
          <input
            value={fields.category}
            onChange={(e) => setFields((f) => ({ ...f, category: e.target.value }))}
          />
        </label>

        <label>
          Specs<br />
          <textarea
            value={fields.specs}
            onChange={(e) => setFields((f) => ({ ...f, specs: e.target.value }))}
            rows={3}
          />
        </label>

        <label>
          Description<br />
          <textarea
            value={fields.description}
            onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))}
            rows={6}
          />
        </label>

        <button type="submit" disabled={busy}>
          Save Product
        </button>

        {msg && (
          <div style={{ padding: 8, background: "#f7f7f7", border: "1px solid #eee" }}>
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
