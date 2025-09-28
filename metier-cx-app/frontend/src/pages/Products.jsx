// src/pages/Products.jsx
import React, { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [API_BASE]);

  if (loading) return <div style={{ padding: 20 }}>Loading products...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 20 }}>Products</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
              }}
            >
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{
                    maxWidth: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginBottom: 12,
                  }}
                />
              )}
              <h3 style={{ margin: "0 0 8px" }}>{p.name}</h3>
              <p style={{ margin: "0 0 8px", color: "#555" }}>
                <strong>SKU:</strong> {p.sku || "N/A"}
              </p>
              <p style={{ margin: "0 0 8px", color: "#777" }}>
                {p.category} — ${p.price}
              </p>
              <p style={{ fontSize: 14, color: "#444" }}>{p.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
