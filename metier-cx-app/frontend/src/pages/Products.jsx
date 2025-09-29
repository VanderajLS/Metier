import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Check if user is admin - simplified version that doesn't rely on auth.js
  const isAdmin = () => {
    const role = sessionStorage.getItem("userRole");
    return role === "admin";
  };

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
        console.log("API Response:", data);
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

  // Filter products based on search term and category
  useEffect(() => {
    let result = [...products];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product =>
          (product.name && product.name.toLowerCase().includes(term)) ||
          (product.description && product.description.toLowerCase().includes(term)) ||
          (product.sku && product.sku.toLowerCase().includes(term))
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        product => product.category === selectedCategory
      );
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const getProductImage = (product) => {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0];
    }
    return "/placeholder.png";
  };

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(product => product.category).filter(Boolean))];

  // Handle product click to navigate to detail page
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif' // Sans-serif font
      }}>
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
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif' // Sans-serif font
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          backgroundColor: '#fee2e2', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <h2 style={{ color: '#b91c1c', marginBottom: '8px' }}>Error Loading Products</h2>
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, system-ui, sans-serif' // Sans-serif font
    }}>
      {/* Header Navigation */}
      <nav style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        borderBottom: '1px solid #e5e7eb' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', textDecoration: 'none' }}>
                Metier Parts
              </Link>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Link to="/products" style={{ 
                  backgroundColor: '#ecfdf5', 
                  color: '#047857', 
                  padding: '8px 16px', 
                  borderRadius: '9999px', 
                  textDecoration: 'none', 
                  fontWeight: '500' 
                }}>
                  Products
                </Link>
                <Link to="/categories" style={{ 
                  backgroundColor: '#eff6ff', 
                  color: '#1d4ed8', 
                  padding: '8px 16px', 
                  borderRadius: '9999px', 
                  textDecoration: 'none' 
                }}>
                  Categories
                </Link>
                <Link to="/fitment" style={{ 
                  backgroundColor: '#fff7ed', 
                  color: '#c2410c', 
                  padding: '8px 16px', 
                  borderRadius: '9999px', 
                  textDecoration: 'none' 
                }}>
                  Fitment
                </Link>
                <Link to="/support" style={{ 
                  backgroundColor: '#faf5ff', 
                  color: '#7e22ce', 
                  padding: '8px 16px', 
                  borderRadius: '9999px', 
                  textDecoration: 'none' 
                }}>
                  Support
                </Link>
                {isAdmin() && (
                  <Link to="/admin" style={{ 
                    backgroundColor: '#f3f4f6', 
                    color: '#4b5563', 
                    padding: '8px 16px', 
                    borderRadius: '9999px', 
                    textDecoration: 'none' 
                  }}>
                    Admin Upload
                  </Link>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                color: '#6b7280'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"></path>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                color: '#6b7280'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              <div style={{ position: 'relative' }}>
                <button style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  color: '#6b7280'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                  </svg>
                </button>
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  0
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Find Your Perfect Part */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '24px' 
          }}>
            Find Your Perfect Part
          </h1>
          
          {/* Search Bar */}
          <div style={{ 
            maxWidth: '700px', 
            margin: '0 auto', 
            position: 'relative' 
          }}>
            <input
              type="text"
              placeholder="Search by part number, vehicle, OEM manufacturer, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 24px',
                paddingRight: '56px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '9999px',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
            <button style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#8b5cf6',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"></path>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Category Buttons */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === "all" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: selectedCategory === "all" ? '600' : '400',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            All Products
          </button>
          <button
            onClick={() => setSelectedCategory("Electronics")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === "Electronics" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: selectedCategory === "Electronics" ? '600' : '400',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Electronics
          </button>
          <button
            onClick={() => setSelectedCategory("Exhaust Systems")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === "Exhaust Systems" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: selectedCategory === "Exhaust Systems" ? '600' : '400',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Exhaust Systems
          </button>
          <button
            onClick={() => setSelectedCategory("Intake Systems")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === "Intake Systems" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: selectedCategory === "Intake Systems" ? '600' : '400',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Intake Systems
          </button>
          <button
            onClick={() => setSelectedCategory("Intercoolers")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === "Intercoolers" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: selectedCategory === "Intercoolers" ? '600' : '400',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Intercoolers
          </button>
          <button
            onClick={() => setSelectedCategory("Turbocharger Components")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === "Turbocharger Components" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: selectedCategory === "Turbocharger Components" ? '600' : '400',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Turbocharger Components
          </button>
          <button
            onClick={() => setSelectedCategory("Turbochargers")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === "Turbochargers" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: selectedCategory === "Turbochargers" ? '600' : '400',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Turbochargers
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6b7280' }}>
              <path d="M3 6h18"></path>
              <path d="M7 12h10"></path>
              <path d="M10 18h4"></path>
            </svg>
            <span style={{ fontWeight: '500', color: '#374151' }}>Filters</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            {filteredProducts.length} products found
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Sort by:</span>
            <select style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '14px',
              color: '#374151'
            }}>
              <option>Best Match</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 0', 
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9ca3af', margin: '0 auto 16px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No products found</h3>
            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
              We couldn't find any products matching your search. Try using different keywords or filters.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Admin Options Menu (visible only to admins) */}
                {isAdmin() && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    zIndex: 10 
                  }}>
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle dropdown menu
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Product Image */}
                <div style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '250px',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px' // Added more padding for smaller image appearance
                }}>
                  <img
                    src={getProductImage(product)}
                    alt={product.name || "Product"}
                    style={{
                      maxWidth: '80%', // Reduced from 100% to 80%
                      maxHeight: '80%', // Reduced from 100% to 80%
                      objectFit: 'contain'
                    }}
                  />
                  
                  {/* Sale Badge */}
                  {product.discountPrice && product.discountPrice < product.price && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      Sale
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '16px' }}>
                  {/* Category */}
                  {product.category && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {product.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Product Name */}
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#111827',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {product.name || "Unnamed Product"}
                  </h3>
                  
                  {/* SKU */}
                  {product.sku && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      SKU: {product.sku}
                    </div>
                  )}
                  
                  {/* Price */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <>
                        <span style={{ 
                          fontSize: '18px', 
                          fontWeight: '700', 
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
                      </>
                    ) : (
                      <span style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#111827' 
                      }}>
                        ${formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to cart logic
                  }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
