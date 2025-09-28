import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

console.log("DEBUG: Products.jsx module loaded");

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  useEffect(() => {
    console.log("DEBUG: Products.jsx useEffect fired. API_BASE:", API_BASE);

    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/admin/public`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        console.log("DEBUG: Products fetched:", data);
        setProducts(data);
      } catch (e) {
        console.error("DEBUG: Error fetching products:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [API_BASE]);

  if (loading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 style={{ color: "red" }}>DEBUG: New Products Page Rendered</h1>
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
