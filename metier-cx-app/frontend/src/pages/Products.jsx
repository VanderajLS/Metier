import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Admin menu state
  const [menuOpen, setMenuOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // POC: pretend current site is admin view
  const isAdmin = true;

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/admin/public`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        const data = await res.json();
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } catch (e) {
        console.error("Error loading products:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [API_BASE]);

  // Handle delete
  async function handleDelete(productId) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { "X-Role": "admin" }, // POC header
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete product.");
    }
  }

  // … (your filtering/sorting useEffect + helpers like formatPrice/getProductImage/getUniqueCategories remain unchanged)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Navigation Header */}
      <nav style={{ backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderBottom: "1px solid #e5e7eb" }}>
        {/* … unchanged nav bar … */}
      </nav>

      {/* Page Header with Search and Filters */}
      {/* … unchanged search/filter controls … */}

      {/* Products Display */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        {filteredProducts.length === 0 ? (
          // … unchanged no products section …
          <div>No products …</div>
        ) : (
          <div
            style={
              viewMode === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px",
                  }
                : {
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }
            }
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  position: "relative", // allow positioning of admin menu
                }}
              >
                {/* 🔐 Admin Menu */}
                {isAdmin && (
                  <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === product.id ? null : product.id)
                      }
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      ⋮
                    </button>
                    {menuOpen === product.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "32px",
                          right: "0",
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          zIndex: 10,
                        }}
                      >
                        <button
                          onClick={() => {
                            setConfirmDelete(product.id);
                            setMenuOpen(null);
                          }}
                          style={{
                            padding: "8px 16px",
                            color: "#dc2626",
                            background: "none",
                            border: "none",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 🗑 Confirmation Dialog */}
                {confirmDelete === product.id && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "24px",
                        maxWidth: "400px",
                        width: "100%",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                        Are you sure you want to delete this product?
                      </h3>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{
                            padding: "8px 16px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            backgroundColor: "white",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(product.id);
                            setConfirmDelete(null);
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* … your existing product image, details, price, description, View Details button … */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {/* … unchanged modal … */}
    </div>
  );
}
