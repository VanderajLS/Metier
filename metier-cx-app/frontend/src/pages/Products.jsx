import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import auth utilities
import { getUserRole, getUserDisplayName, logout, isAdmin, ROLES } from "../utils/auth";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  
  // Admin options states
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(null);
  const [inventoryValue, setInventoryValue] = useState("");

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";
  
  // Get user info
  const userRole = getUserRole();
  const userDisplayName = getUserDisplayName();
  const isUserAdmin = isAdmin();

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

  // Close options menu when clicking outside
  useEffect(() => {
    function handleClickOutside() {
      setShowOptionsMenu(null);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case "price-high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
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

  const getUniqueCategories = () => {
    const categories = products.map(p => p.category).filter(Boolean);
    return [...new Set(categories)];
  };

  // Admin functions
  const handleDeleteProduct = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${product.id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setProducts(products.filter(p => p.id !== product.id));
        setShowDeleteModal(null);
        alert("Product deleted successfully");
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      alert("Error deleting product: " + e.message);
    }
  };

  const handleEditProduct = (product) => {
    navigate(`/admin/edit/${product.id}`);
  };

  const handleInventoryUpdate = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: parseInt(inventoryValue) })
      });
      
      if (res.ok) {
        // Update local state
        setProducts(products.map(p => 
          p.id === product.id ? { ...p, inventory: parseInt(inventoryValue) } : p
        ));
        setShowInventoryModal(null);
        setInventoryValue("");
        alert("Inventory updated successfully");
      } else {
        alert("Failed to update inventory");
      }
    } catch (e) {
      alert("Error updating inventory: " + e.message);
    }
  };

  const openInventoryModal = (product) => {
    setShowInventoryModal(product);
    setInventoryValue(product.inventory?.toString() || "0");
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
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', padding: '24px' }}>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Error Loading Products</h2>
            <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ 
                backgroundColor: userRole === ROLES.ADMIN ? '#dbeafe' : '#dcfce7', 
                color: userRole === ROLES.ADMIN ? '#1d4ed8' : '#166534', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '500' 
              }}>
                {userDisplayName}
              </span>
              <button
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header with Search and Filters */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
              Products Catalog
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {filteredProducts.length} of {products.length} products
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'grid' ? '#2563eb' : 'white',
                  color: viewMode === 'grid' ? 'white' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'list' ? '#2563eb' : 'white',
                  color: viewMode === 'list' ? 'white' : '#6b7280',
                  border: 'none',
                  borderLeft: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                {searchTerm || selectedCategory !== "all" ? "No products found" : "No Products Available"}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Check back later for new products"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
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
              )}
            </div>
          </div>
        ) : (
          <div style={viewMode === 'grid' ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          } : {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={viewMode === 'grid' ? {
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                transition: 'box-shadow 0.2s',
                cursor: 'pointer',
                position: 'relative'
              } : {
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                display: 'flex',
                transition: 'box-shadow 0.2s',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}>
                
                {/* Admin Options Menu */}
                {isUserAdmin && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 10
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(showOptionsMenu === product.id ? null : product.id);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#111827';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      ⋯
                    </button>
                    
                    {/* Options Dropdown */}
                    {showOptionsMenu === product.id && (
                      <div style={{
                        position: 'absolute',
                        top: '28px',
                        right: '0',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        minWidth: '120px',
                        zIndex: 20
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                            setShowOptionsMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#374151',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInventoryModal(product);
                            setShowOptionsMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#374151',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Edit Inventory
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteModal(product);
                            setShowOptionsMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#dc2626',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Image */}
                <div 
                  onClick={() => setSelectedProduct(product)}
                  style={viewMode === 'grid' ? {
                    position: 'relative',
                    width: '100%',
                    height: '250px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6'
                  } : {
                    position: 'relative',
                    width: '200px',
                    height: '150px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
                    flexShrink: 0
                  }}
                >
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
                  />
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
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

                <div 
                  onClick={() => setSelectedProduct(product)}
                  style={{ padding: '16px', flex: viewMode === 'list' ? 1 : 'none' }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontWeight: '600',
                      fontSize: viewMode === 'grid' ? '18px' : '20px',
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
                          fontSize: viewMode === 'grid' ? '20px' : '24px',
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
                        fontSize: viewMode === 'grid' ? '20px' : '24px',
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

                  {/* Description */}
                  {product.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '12px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: viewMode === 'grid' ? 2 : 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description.replace(/\*\*/g, '').slice(0, viewMode === 'grid' ? 100 : 200)}...
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                      style={{
                        flex: 1,
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
                    >
                      View Details
                    </button>
                    
                    {userRole === ROLES.CUSTOMER && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Add to cart functionality coming soon!");
                        }}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              Delete Product
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Are you sure you want to delete "{showDeleteModal.name}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(showDeleteModal)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Edit Modal */}
      {showInventoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              Update Inventory
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Update inventory for "{showInventoryModal.name}"
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Current Stock
              </label>
              <input
                type="number"
                value={inventoryValue}
                onChange={(e) => setInventoryValue(e.target.value)}
                min="0"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowInventoryModal(null);
                  setInventoryValue("");
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleInventoryUpdate(showInventoryModal)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

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
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
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
                  {selectedProduct.discountPrice && selectedProduct.discountPrice < selectedProduct.price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-600">
                        ${formatPrice(selectedProduct.discountPrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${formatPrice(selectedProduct.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      ${formatPrice(selectedProduct.price)}
                    </span>
                  )}
                </div>

                {selectedProduct.sku && (
                  <p className="text-sm text-gray-600 mb-4">
                    SKU: {selectedProduct.sku}
                  </p>
                )}

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

                <div className="flex gap-3 pt-4 border-t">
                  {userRole === ROLES.CUSTOMER && (
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition-colors font-medium">
                      Add to Cart
                    </button>
                  )}
                  
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-md transition-colors font-medium">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
