import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, ShoppingCart, Star } from "lucide-react";

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
        setError("");
        const res = await fetch(`${API_BASE}/api/admin/public`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        const data = await res.json();
        console.log("API Response:", data); // Debug log
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
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
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
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products Catalog</h1>
              <p className="text-gray-600 mt-1">
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ✓ NEW GRID LAYOUT
            </Badge>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600">Check back later for new products.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={getProductImage(product)}
                    alt={product.name || "Product"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                  {product.discountPrice && product.discountPrice < product.price && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      Sale
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                      {product.name || "Unnamed Product"}
                    </h3>
                  </div>
                  
                  {product.category && (
                    <Badge variant="outline" className="w-fit text-xs">
                      {product.category}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="pt-0 pb-2">
                  {/* Price */}
                  <div className="mb-3">
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">
                          ${formatPrice(product.discountPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">
                        ${formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* SKU */}
                  {product.sku && (
                    <p className="text-xs text-gray-500 mb-2">
                      SKU: {product.sku}
                    </p>
                  )}

                  {/* Short Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {product.description.replace(/\*\*/g, '').slice(0, 100)}...
                    </p>
                  )}

                  {/* Specs Preview */}
                  {product.specs && (
                    <div className="text-xs text-gray-500 mb-3">
                      <ReactMarkdown className="line-clamp-2">
                        {product.specs.split('\n').slice(0, 2).join('\n')}
                      </ReactMarkdown>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full"
                    variant="default"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
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
              {/* Image Gallery */}
              <div className="lg:w-1/2 bg-gray-50 p-6 flex flex-col">
                <div className="flex-1 flex items-center justify-center mb-4">
                  <img
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="max-w-full max-h-[400px] object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </div>
                
                {/* Thumbnail Gallery */}
                {selectedProduct.product_images && selectedProduct.product_images.length > 1 && (
                  <div className="flex gap-2 justify-center flex-wrap">
                    {selectedProduct.product_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border-2 border-transparent hover:border-blue-500 cursor-pointer transition-colors"
                        onClick={() => {
                          // Move clicked image to front
                          const newImages = [image, ...selectedProduct.product_images.filter(img => img !== image)];
                          setSelectedProduct({
                            ...selectedProduct,
                            product_images: newImages
                          });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="lg:w-1/2 p-6 overflow-y-auto">
                <DialogHeader className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold mb-2">
                        {selectedProduct.name}
                      </DialogTitle>
                      {selectedProduct.category && (
                        <Badge variant="outline" className="mb-3">
                          {selectedProduct.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                {/* Price */}
                <div className="mb-6">
                  {selectedProduct.discountPrice && selectedProduct.discountPrice < selectedProduct.price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-600">
                        ${formatPrice(selectedProduct.discountPrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${formatPrice(selectedProduct.price)}
                      </span>
                      <Badge className="bg-red-500 text-white">
                        Save ${formatPrice(selectedProduct.price - selectedProduct.discountPrice)}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      ${formatPrice(selectedProduct.price)}
                    </span>
                  )}
                </div>

                {/* SKU & Inventory */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                  {selectedProduct.sku && (
                    <span>SKU: {selectedProduct.sku}</span>
                  )}
                  {selectedProduct.inventory && (
                    <span className="text-green-600">
                      {selectedProduct.inventory} in stock
                    </span>
                  )}
                </div>

                {/* Specifications */}
                {selectedProduct.specs && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Specifications</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ReactMarkdown className="text-sm text-gray-700 prose prose-sm max-w-none">
                        {selectedProduct.specs}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedProduct.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Description</h4>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown className="text-gray-700 leading-relaxed">
                        {selectedProduct.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1" size="lg">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
