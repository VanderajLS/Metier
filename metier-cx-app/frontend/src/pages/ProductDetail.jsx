import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  // Check if user is admin - simplified version that doesn't rely on auth.js
  const isAdmin = () => {
    const role = sessionStorage.getItem("userRole");
    return role === "admin";
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/admin/public`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        const data = await res.json();
        
        // Find the specific product by ID
        const foundProduct = Array.isArray(data) 
          ? data.find(p => p.id === parseInt(productId) || p.id === productId)
          : null;
          
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
  }, [API_BASE, productId]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const getProductImages = (product) => {
    if (!product) return [];
    
    const images = [];
    
    // Only use product_images array, NOT the image_url (which is for AI description)
    if (product.product_images && Array.isArray(product.product_images)) {
      images.push(...product.product_images);
    }
    
    // If no images, add placeholder
    if (images.length === 0) {
      images.push("/placeholder.png");
    }
    
    return images;
  };

  // Format specifications with proper styling
  const formatSpecs = (specs) => {
    if (!specs) return "No specifications available.";
    
    // Replace markdown bold syntax with HTML
    let formattedSpecs = specs.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to HTML
    formattedSpecs = formattedSpecs.replace(/\n/g, '<br>');
    
    return formattedSpecs;
  };

  // Format description with proper styling
  const formatDescription = (description) => {
    if (!description) return "No description available.";
    
    // Replace markdown bold syntax with HTML
    let formattedDescription = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to HTML
    formattedDescription = formattedDescription.replace(/\n/g, '<br>');
    
    return formattedDescription;
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(1, quantity + amount);
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
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
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
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);
  const currentImage = productImages[selectedImage] || "/placeholder.png";
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header Navigation */}
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', textDecoration: 'none' }}>
                Metier Turbo
              </Link>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Link to="/products" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                  Products
                </Link>
                {isAdmin() && (
                  <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none' }}>
                    Admin Upload
                  </Link>
                )}
                <Link to="/orders" style={{ color: '#6b7280', textDecoration: 'none' }}>
                  Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        <Link 
          to="/products" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            color: '#6b7280', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <span style={{ marginRight: '4px' }}>←</span> Back to Products
        </Link>
      </div>

      {/* Breadcrumb Navigation */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '8px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
            <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/products" style={{ color: '#6b7280', textDecoration: 'none' }}>Products</Link>
            {product.category && (
              <>
                <span style={{ margin: '0 8px' }}>/</span>
                <Link to={`/products?category=${product.category}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
                  {product.category}
                </Link>
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
          display: 'flex', 
          flexDirection: 'row', 
          gap: '48px',
          flexWrap: 'wrap'
        }}>
          {/* Left Column - Product Images */}
          <div style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
            {/* Main Product Image */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px'
            }}>
              <img 
                src={currentImage} 
                alt={product.name} 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {productImages.map((image, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      border: selectedImage === index ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - View ${index + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            {/* Product Category */}
            {product.category && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {product.category}
                </span>
              </div>
            )}

            {/* Product Name */}
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginTop: '8px',
              marginBottom: '16px'
            }}>
              {product.name}
            </h1>

            {/* SKU */}
            {product.sku && (
              <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                SKU: {product.sku}
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: '24px' }}>
              {product.discountPrice && product.discountPrice < product.price ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: '#059669' }}>
                    ${formatPrice(product.discountPrice)}
                  </span>
                  <span style={{ fontSize: '20px', color: '#6b7280', textDecoration: 'line-through' }}>
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
                <span style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                  ${formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Inventory Status */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{
                backgroundColor: parseInt(product.inventory) > 0 ? '#dcfce7' : '#fee2e2',
                color: parseInt(product.inventory) > 0 ? '#166534' : '#991b1b',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {parseInt(product.inventory) > 0 ? `${product.inventory} in stock` : 'Out of stock'}
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
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827', 
                marginTop: 0,
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Product Specifications
              </h2>
              <div 
                style={{ 
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5'
                }}
                dangerouslySetInnerHTML={{ __html: formatSpecs(product.specs) }}
              />
            </div>

            {/* Product Description */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827', 
                marginTop: 0,
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Product Description
              </h2>
              <div 
                style={{ 
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5'
                }}
                dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
              />
            </div>

            {/* Quantity Selector */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'white',
                    border: 'none',
                    borderRight: '1px solid #d1d5db',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: quantity <= 1 ? '#d1d5db' : '#374151'
                  }}
                >
                  −
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: '16px'
                  }}
                />
                <button 
                  onClick={() => handleQuantityChange(1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'white',
                    border: 'none',
                    borderLeft: '1px solid #d1d5db',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#374151'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              disabled={parseInt(product.inventory) <= 0}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: parseInt(product.inventory) > 0 ? '#2563eb' : '#e5e7eb',
                color: parseInt(product.inventory) > 0 ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: parseInt(product.inventory) > 0 ? 'pointer' : 'not-allowed',
                marginBottom: '24px'
              }}
            >
              {parseInt(product.inventory) > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Shipping & Warranty Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <button style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>Shipping Info</span>
              </button>
              <button style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>Warranty</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
