// metier-cx-app/frontend/src/pages/AdminProductUpload.jsx
import React, { useState } from "react";
import { aiDescribe, createProductJson, uploadProductWithImage } from "../services/adminApi";

export default function AdminProductUpload() {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [specs, setSpecs] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const useFile = Boolean(file);

  async function handleGenerate() {
    try {
      setBusy(true); setMsg("Generating with AI...");
      const data = await aiDescribe({
        name, sku, category,
        price: price ? Number(price) : undefined,
        image_url: imageUrl || undefined,
        specs: specs || undefined,
      });
      setDescription(data.description || "");
      setMsg("Generated.");
    } catch (e) {
      setMsg(`AI error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setMsg("Name is required.");
    try {
      setBusy(true); setMsg("Saving product...");
      if (useFile) {
        await uploadProductWithImage({
          name,
          sku,
          category,
          price: price ? Number(price) : 0,
          description: description || "",
          specs,
          file,
        });
      } else {
        await createProductJson({
          name,
          sku,
          category,
          price: price ? Number(price) : 0,
          image_url: imageUrl || "",
          description: description || "",
          specs,
        });
      }
      setMsg("Saved. Check your catalog!");
      // quick reset
      setName(""); setSku(""); setCategory(""); setPrice("");
      setSpecs(""); setImageUrl(""); setFile(null); setDescription("");
    } catch (e) {
      setMsg(`Save error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{maxWidth: 900, margin: "40px auto", padding: 16}}>
      <h1 style={{marginBottom: 12}}>Admin: Upload Product</h1>
      <form onSubmit={handleSubmit} style={{display: "grid", gap: 12}}>
        <label>
          Name*<br/>
          <input value={name} onChange={e=>setName(e.target.value)} required style={{width:"100%"}}/>
        </label>
        <label>
          SKU<br/>
          <input value={sku} onChange={e=>setSku(e.target.value)} style={{width:"100%"}}/>
        </label>
        <label>
          Category<br/>
          <input value={category} onChange={e=>setCategory(e.target.value)} style={{width:"100%"}}/>
        </label>
        <label>
          Price<br/>
          <input type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} style={{width:"100%"}}/>
        </label>
        <label>
          Specs/Notes (optional)<br/>
          <textarea value={specs} onChange={e=>setSpecs(e.target.value)} rows={3} style={{width:"100%"}} />
        </label>

        <fieldset style={{border: "1px solid #ddd", padding: 12}}>
          <legend>Image</legend>
          <div style={{display: "grid", gap: 8}}>
            <label>
              Image URL (preferred for production)<br/>
              <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://..." style={{width:"100%"}}/>
            </label>
            <div style={{textAlign:"center"}}>— or —</div>
            <label>
              Upload file (ephemeral on Railway)<br/>
              <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </fieldset>

        <label>
          Description (leave blank to generate)<br/>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={6} style={{width:"100%"}}/>
        </label>

        <div style={{display:"flex", gap: 8}}>
          <button type="button" onClick={handleGenerate} disabled={busy || !name.trim()}>
            {busy ? "Working..." : "Generate with AI"}
          </button>
          <button type="submit" disabled={busy || !name.trim()}>Save Product</button>
        </div>

        {msg && <div style={{padding:8, background:"#f7f7f7", border:"1px solid #eee"}}>{msg}</div>}
      </form>
      <p style={{marginTop:16, color:"#666", fontSize:13}}>
        Tip: for persistent images, host on S3/R2/etc. and paste the public URL. File uploads to Railway are best for demos.
      </p>
    </div>
  );
}
