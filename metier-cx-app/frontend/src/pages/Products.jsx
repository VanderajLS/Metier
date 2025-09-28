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

  useEffect(( ) => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/admin/public`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        const data = await res.json();
        console.log("API Response:", data);
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error loading products:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [API_BASE]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const getProductImage = (product) => {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0];
    }
    if (product.image_url) {
      return product.image_url;
    }
    return "/placeholder.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Products Catalog
              </h1>
              <p style={{ color: '#6b7280', marginTop: '4px', margin: 0 }}>
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
            <span style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ✓ NEW GRID LAYOUT - FIXED IMAGES
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>No Products Found</h3>
              <p style={{ color: '#6b7280' }}>Check back later for new products.</p>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {products.map((product) => (
              <div key={product.id} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                transition: 'box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}>
                
                {/* Product Image - FIXED SIZE */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '250px',
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6'
                }}>
                  <img
                    src={getProductImage(product)}
                    alt={product.name || "Product"}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.2s'
                    }}
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Sale
                    </span>
                  )}
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontWeight: '600',
                      fontSize: '18px',
                      lineHeight: '1.2',
                      marginBottom: '4px',
                      color: '#111827'
                    }}>
                      {product.name || "Unnamed Product"}
                    </h3>
                    {product.category && (
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: '12px' }}>
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#059669'
                        }}>
                          ${formatPrice(product.discountPrice)}
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          textDecoration: 'line-through'
                        }}>
                          ${formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#111827'
                      }}>
                        ${formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* SKU */}
                  {product.sku && (
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      SKU: {product.sku}
                    </p>
                  )}

                  {/* Short Description */}
                  {product.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '12px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description.replace(/\*\*/g, '').slice(0, 100)}...
                    </p>
                  )}

                  <button
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          {selectedProduct && (
            <div className="flex flex-col lg:flex-row h-full">
              <div className="lg:w-1/2 bg-gray-50 p-6 flex flex-col">
                <div className="flex-1 flex items-center justify-center mb-4">
                  <img
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="max-w-full max-h-[400px] object-contain rounded-lg"
                  />
                </div>
              </div>
              <div className="lg:w-1/2 p-6 overflow-y-auto">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold mb-2">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    ${formatPrice(selectedProduct.discountPrice || selectedProduct.price)}
                  </span>
                </div>
                {selectedProduct.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Description</h4>
                    <ReactMarkdown className="text-gray-700 leading-relaxed">
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
