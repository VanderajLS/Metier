import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  
  const navigate = useNavigate();

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

  useEffect(() => {
    // Filter products based on search term and category
    let filtered = [...products];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          (product.name && product.name.toLowerCase().includes(search)) ||
          (product.description && product.description.toLowerCase().includes(search)) ||
          (product.sku && product.sku.toLowerCase().includes(search)) ||
          (product.specs && product.specs.toLowerCase().includes(search))
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case "price_high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case "name":
        default:
          return a.name?.localeCompare(b.name);
      }
    });
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

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

  const getCategories = () => {
    const categories = new Set();
    products.forEach((product) => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return ["all", ...Array.from(categories)];
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const getCategoryDisplayName = (category) => {
    if (category === "all") return "All Categories";
    return category.charAt(0).toUpperCase() + category.slice(1);
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
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#111827', 
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Find Your Perfect Part
        </h1>

        {/* Search Bar */}
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          marginBottom: '32px',
          position: 'relative'
        }}>
          <input 
            type="text"
            placeholder="Search by part number, vehicle, OEM manufacturer, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              paddingRight: '48px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '9999px',
              outline: 'none'
            }}
          />
          <button style={{
            position: 'absolute',
            right: '4px',
            top: '4px',
            width: '40px',
            height: '40px',
            backgroundColor: '#8b5cf6',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"></path>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
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
              padding: '8px 16px',
              backgroundColor: selectedCategory === "all" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: selectedCategory === "all" ? '500' : 'normal'
            }}
          >
            All Categories
          </button>
          <button 
            onClick={() => setSelectedCategory("Electronics")}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === "Electronics" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: selectedCategory === "Electronics" ? '500' : 'normal'
            }}
          >
            Electronics
          </button>
          <button 
            onClick={() => setSelectedCategory("Exhaust Systems")}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === "Exhaust Systems" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: selectedCategory === "Exhaust Systems" ? '500' : 'normal'
            }}
          >
            Exhaust Systems
          </button>
          <button 
            onClick={() => setSelectedCategory("Intake Systems")}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === "Intake Systems" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: selectedCategory === "Intake Systems" ? '500' : 'normal'
            }}
          >
            Intake Systems
          </button>
          <button 
            onClick={() => setSelectedCategory("Intercoolers")}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === "Intercoolers" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: selectedCategory === "Intercoolers" ? '500' : 'normal'
            }}
          >
            Intercoolers
          </button>
          <button 
            onClick={() => setSelectedCategory("Turbocharger Components")}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === "Turbocharger Components" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: selectedCategory === "Turbocharger Components" ? '500' : 'normal'
            }}
          >
            Turbocharger Components
          </button>
          <button 
            onClick={() => setSelectedCategory("Turbochargers")}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === "Turbochargers" ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: selectedCategory === "Turbochargers" ? '500' : 'normal'
            }}
          >
            Turbochargers
          </button>
        </div>

        {/* Filters and View Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M7 12h10"></path>
                <path d="M10 18h4"></path>
              </svg>
              Filters
            </button>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {filteredProducts.length} products found
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              >
                <option value="name">Name</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
            
            {/* View Toggle */}
            <div style={{ 
              display: 'flex', 
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <button 
                onClick={() => setViewMode("grid")}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  backgroundColor: viewMode === "grid" ? '#f3f4f6' : 'white',
                  border: 'none',
                  borderRight: '1px solid #d1d5db',
                  cursor: 'pointer',
                  color: viewMode === "grid" ? '#111827' : '#6b7280'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"></rect>
                  <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                  <rect width="7" height="7" x="14" y="14" rx="1"></rect>
                  <rect width="7" height="7" x="3" y="14" rx="1"></rect>
                </svg>
              </button>
              <button 
                onClick={() => setViewMode("list")}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  backgroundColor: viewMode === "list" ? '#f3f4f6' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === "list" ? '#111827' : '#6b7280'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="21" y1="6" y2="6"></line>
                  <line x1="8" x2="21" y1="12" y2="12"></line>
                  <line x1="8" x2="21" y1="18" y2="18"></line>
                  <line x1="3" x2="3.01" y1="6" y2="6"></line>
                  <line x1="3" x2="3.01" y1="12" y2="12"></line>
                  <line x1="3" x2="3.01" y1="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '24px' 
          }}>
            <p style={{ color: '#b91c1c', fontWeight: '500' }}>Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Products Found */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '32px', 
            textAlign: 'center',
            marginBottom: '24px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              No products found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Try adjusting your search or filter criteria.
            </p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Products Grid View */}
        {viewMode === "grid" && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Admin Options */}
                {isAdmin() && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10
                  }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle dropdown menu
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                )}

                {/* Sale Badge */}
                {product.discountPrice && product.discountPrice < product.price && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    zIndex: 10
                  }}>
                    Sale
                  </div>
                )}

                {/* Out of Stock Badge */}
                {parseInt(product.inventory) <= 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: product.discountPrice && product.discountPrice < product.price ? '64px' : '12px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    zIndex: 10
                  }}>
                    Out of Stock
                  </div>
                )}

                {/* Product Image */}
                <div style={{ 
                  height: '220px', 
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px'
                }}>
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* Product Details */}
                <div style={{ padding: '16px' }}>
                  {product.category && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      {product.category}
                    </div>
                  )}
                  
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#111827',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {product.name}
                  </h3>
                  
                  {product.sku && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      SKU: {product.sku}
                    </div>
                  )}
                  
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
                  
                  <button style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: parseInt(product.inventory) <= 0 ? '#d1d5db' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: parseInt(product.inventory) <= 0 ? 'not-allowed' : 'pointer'
                  }}>
                    {parseInt(product.inventory) <= 0 ? 'Out of Stock' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products List View */}
        {viewMode === "list" && (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Admin Options */}
                {isAdmin() && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10
                  }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle dropdown menu
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                )}

                {/* Product Image */}
                <div style={{ 
                  width: '180px',
                  height: '180px',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  position: 'relative'
                }}>
                  {/* Sale Badge */}
                  {product.discountPrice && product.discountPrice < product.price && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      zIndex: 10
                    }}>
                      Sale
                    </div>
                  )}

                  {/* Out of Stock Badge */}
                  {parseInt(product.inventory) <= 0 && (
                    <div style={{
                      position: 'absolute',
                      top: product.discountPrice && product.discountPrice < product.price ? '40px' : '8px',
                      left: '8px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      zIndex: 10
                    }}>
                      Out of Stock
                    </div>
                  )}

                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* Product Details */}
                <div style={{ 
                  flex: '1',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ flex: '1' }}>
                    {product.category && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        {product.category}
                      </div>
                    )}
                    
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#111827',
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      {product.name}
                    </h3>
                    
                    {product.sku && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        SKU: {product.sku}
                      </div>
                    )}
                    
                    {/* Short Description */}
                    {product.description && (
                      <div style={{ 
                        fontSize: '14px',
                        color: '#4b5563',
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.description.replace(/\*\*/g, '').substring(0, 120)}
                        {product.description.length > 120 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px'
                    }}>
                      {product.discountPrice && product.discountPrice < product.price ? (
                        <>
                          <span style={{ 
                            fontSize: '20px', 
                            fontWeight: '700', 
                            color: '#059669' 
                          }}>
                            ${formatPrice(product.discountPrice)}
                          </span>
                          <span style={{ 
                            fontSize: '16px', 
                            color: '#6b7280', 
                            textDecoration: 'line-through' 
                          }}>
                            ${formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#111827' 
                        }}>
                          ${formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: parseInt(product.inventory) <= 0 ? '#d1d5db' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: parseInt(product.inventory) <= 0 ? 'not-allowed' : 'pointer'
                    }}>
                      {parseInt(product.inventory) <= 0 ? 'Out of Stock' : 'View Details'}
                    </button>
                  </div>
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
