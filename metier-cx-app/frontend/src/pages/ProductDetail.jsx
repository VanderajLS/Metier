import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getUserRole, isAdmin, ROLES } from "../utils/auth";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Get user info
  const userRole = getUserRole();
  const isUserAdmin = isAdmin();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        
        // Fetch all products and find the one with matching ID
        const res = await fetch(`${API_BASE}/api/admin/public`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        
        const products = await res.json();
        const foundProduct = products.find(p => p.id === parseInt(productId));
        
        if (!foundProduct) {
          throw new Error("Product not found");
        }
        
        setProduct(foundProduct);
      } catch (e) {
        console.error("Error loading product:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (productId) {
      loadProduct();
    }
  }, [productId, API_BASE]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const getProductImages = (product) => {
    if (!product) return [];
    
    const images = [];
    
    if (product.product_images && product.product_images.length > 0) {
      images.push(...product.product_images);
    }
    
    if (product.image_url && !images.includes(product.image_url)) {
      images.push(product.image_url);
    }
    
    // Ensure we have at least one image
    if (images.length === 0) {
      images.push("/placeholder.png");
    }
    
    return images;
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', padding: '24px' }}>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Error Loading Product</h2>
            <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
            <button 
              onClick={() => navigate('/products')} 
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', padding: '24px' }}>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Product Not Found</h2>
            <p style={{ color: '#dc2626', marginBottom: '16px' }}>The requested product could not be found.</p>
            <button 
              onClick={() => navigate('/products')} 
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation Header */}
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', textDecoration: 'none' }}>
                Metier CX
              </Link>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Link to="/products" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                  Products
                </Link>
                {isUserAdmin && (
                  <>
                    <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none' }}>
                      Admin Upload
                    </Link>
                    <Link to="/admin/orders" style={{ color: '#6b7280', textDecoration: 'none' }}>
                      Orders
                    </Link>
                  </>
                )}
                {userRole === ROLES.CUSTOMER && (
                  <Link to="/cart" style={{ color: '#6b7280', textDecoration: 'none' }}>
                    Cart
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Back to Products */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 16px' }}>
          <Link 
            to="/products" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#4b5563', 
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            <span>←</span> Back to Products
          </Link>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
            <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/products" style={{ color: '#6b7280', textDecoration: 'none' }}>Products</Link>
            {product.category && (
              <>
                <span style={{ margin: '0 8px' }}>/</span>
                <span>{product.category}</span>
              </>
            )}
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#111827' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', 
          gap: '32px',
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
          }
        }}>
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={productImages[selectedImage]} 
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
            </div>
            
            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                gap: '8px' 
              }}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      padding: '8px',
                      border: index === selectedImage ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`View ${index + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div>
            {/* Product Name and SKU */}
            <div style={{ marginBottom: '16px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                {product.name}
              </h1>
              {product.sku && (
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  SKU: {product.sku}
                </p>
              )}
            </div>

            {/* Price */}
            <div style={{ marginBottom: '24px' }}>
              {product.discountPrice && product.discountPrice < product.price ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>
                    ${formatPrice(product.discountPrice)}
                  </span>
                  <span style={{ fontSize: '18px', color: '#6b7280', textDecoration: 'line-through' }}>
                    ${formatPrice(product.price)}
                  </span>
                  <span style={{ 
                    backgroundColor: '#dcfce7', 
                    color: '#166534', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}>
                    Save ${formatPrice(product.price - product.discountPrice)}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
                  ${formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Inventory Status */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ 
                display: 'inline-block',
                backgroundColor: product.inventory > 0 ? '#dcfce7' : '#fef2f2',
                color: product.inventory > 0 ? '#166534' : '#991b1b',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Product Specifications */}
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Product Specifications
              </h2>
              <div style={{ fontSize: '14px' }}>
                {product.specs ? (
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {product.specs}
                  </ReactMarkdown>
                ) : (
                  <p style={{ color: '#6b7280' }}>No specifications available</p>
                )}
              </div>
            </div>

            {/* Quantity Selector and Add to Cart */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  overflow: 'hidden' 
                }}>
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9fafb',
                      border: 'none',
                      borderRight: '1px solid #d1d5db',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    −
                  </button>
                  <span style={{ 
                    padding: '0 16px', 
                    fontSize: '14px',
                    minWidth: '40px',
                    textAlign: 'center'
                  }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9fafb',
                      border: 'none',
                      borderLeft: '1px solid #d1d5db',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    +
                  </button>
                </div>
                <button 
                  style={{
                    flex: '1',
                    backgroundColor: product.inventory > 0 ? '#2563eb' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: product.inventory > 0 ? 'pointer' : 'not-allowed'
                  }}
                  disabled={product.inventory <= 0}
                  onClick={() => {
                    if (product.inventory > 0) {
                      alert(`Added ${quantity} ${product.name} to cart`);
                    }
                  }}
                >
                  {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
              
              {/* Shipping and Warranty */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  flex: '1',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '10px 0',
                  fontSize: '14px',
                  color: '#4b5563',
                  cursor: 'pointer'
                }}>
                  Shipping Info
                </button>
                <button style={{
                  flex: '1',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '10px 0',
                  fontSize: '14px',
                  color: '#4b5563',
                  cursor: 'pointer'
                }}>
                  Warranty
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Product Description
              </h2>
              <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                {product.description ? (
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {product.description}
                  </ReactMarkdown>
                ) : (
                  <p>No description available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (min-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
