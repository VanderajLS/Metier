import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/admin/public`);
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

  if (loading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col"
            >
              {/* Product image */}
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}

              <div className="p-4 flex-1 flex flex-col">
                {/* Name */}
                <h3 className="font-semibold text-lg truncate mb-2">
                  {p.name || "Unnamed product"}
                </h3>

                {/* Price & stock */}
                <div className="mb-2 text-gray-700">
                  {p.price && (
                    <span className="font-bold text-green-700">
                      ${parseFloat(p.price).toFixed(2)}
                    </span>
                  )}
                  {p.inventory && (
                    <span className="ml-3 text-sm text-gray-600">
                      In Stock: {p.inventory}
                    </span>
                  )}
                </div>

                {/* SKU & Category */}
                <p className="text-sm text-gray-500 mb-2">
                  {p.sku && <span>SKU: {p.sku}</span>}
                  {p.category && <span className="ml-2">{p.category}</span>}
                </p>

                {/* Specs preview (first 2 bullets) */}
                {p.specs && (
                  <div className="text-sm text-gray-700 mb-2">
                    <ReactMarkdown>
                      {p.specs.split("\n").slice(0, 2).join("\n")}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Short description preview */}
                {p.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {p.description.slice(0, 150)}...
                  </p>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedProduct && (
            <div className="flex flex-col lg:flex-row">
              {/* Images */}
              <div className="lg:w-1/2 bg-gray-50 flex items-center justify-center">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="object-contain max-h-[400px] p-4"
                />
              </div>

              {/* Info */}
              <div className="lg:w-1/2 p-6 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Price & stock */}
                <div className="mb-4">
                  {selectedProduct.price && (
                    <p className="text-xl font-bold text-green-700">
                      ${parseFloat(selectedProduct.price).toFixed(2)}
                    </p>
                  )}
                  {selectedProduct.inventory && (
                    <p className="text-sm text-gray-600">
                      In Stock: {selectedProduct.inventory}
                    </p>
                  )}
                </div>

                {/* SKU & Category */}
                <p className="text-sm text-gray-500 mb-4">
                  {selectedProduct.sku && (
                    <span>SKU: {selectedProduct.sku}</span>
                  )}
                  {selectedProduct.category && (
                    <span className="ml-2">{selectedProduct.category}</span>
                  )}
                </p>

                {/* Full Specs */}
                {selectedProduct.specs && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Specifications</h4>
                    <ReactMarkdown className="text-sm text-gray-700">
                      {selectedProduct.specs}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Full Description */}
                {selectedProduct.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <ReactMarkdown className="text-sm text-gray-700 leading-relaxed">
                      {selectedProduct.description}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
