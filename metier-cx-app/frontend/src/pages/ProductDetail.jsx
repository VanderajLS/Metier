import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFitmentChat, setShowFitmentChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Check if user is admin - simplified version that doesn't rely on auth.js
  const isAdmin = () => {
    const role = sessionStorage.getItem("userRole");
    return role === "admin";
  };

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

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
  }, [productId, API_BASE]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const getProductImages = (product) => {
    if (!product) return [];
    
    // Filter out the AI description image if it exists
    if (product.product_images && product.product_images.length > 0) {
      // Assuming the AI description image might contain "description" in the URL
      return product.product_images.filter(img => !img.includes("description"));
    }
    
    return ["/placeholder.png"];
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Convert markdown-style formatting to HTML
  const formatSpecifications = (specs) => {
    if (!specs) return "";
    
    // Replace markdown bold with HTML bold
    let formatted = specs.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace line breaks with HTML breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  // Open fitment chat
  const openFitmentChat = () => {
    setShowFitmentChat(true);
    // Add initial AI message
    setChatMessages([
      {
        role: "assistant",
        content: `I can help you with fitment for ${product.name}. Please provide a VIN, OE #, or general vehicle information.`
      }
    ]);
  };

  // Close fitment chat
  const closeFitmentChat = () => {
    setShowFitmentChat(false);
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = userInput.trim();
    setUserInput("");
    setIsSendingMessage(true);
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    try {
      // Simulate AI response (in a real implementation, this would call OpenAI API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let aiResponse;
      
      // Check if the message is about the product or fitment
      if (isProductRelatedQuestion(userMessage, product)) {
        // Generate a response about the product or fitment
        aiResponse = generateFitmentResponse(userMessage, product);
      } else {
        // Not related to the product
        aiResponse = "I'm sorry, but I'm only able to answer questions about Metier products.";
      }
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error processing your request. Please try again." 
      }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Check if the message is related to the product
  const isProductRelatedQuestion = (message, product) => {
    const lowerMessage = message.toLowerCase();
    const productTerms = [
      product.name.toLowerCase(),
      "fitment",
      "fit",
      "compatible",
      "work with",
      "vehicle",
      "car",
      "truck",
      "suv",
      "vin",
      "year",
      "make",
      "model",
      "engine",
      "turbo",
      "turbocharger",
      "specs",
      "specifications",
      "dimensions",
      "size",
      "weight",
      "install",
      "installation",
      "warranty"
    ];
    
    return productTerms.some(term => lowerMessage.includes(term));
  };

  // Generate a fitment response
  const generateFitmentResponse = (message, product) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for VIN patterns (simplified)
    const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/i;
    const hasVin = vinPattern.test(message);
    
    // Check for vehicle year/make/model patterns
    const yearPattern = /\b(19|20)\d{2}\b/;
    const hasYear = yearPattern.test(message);
    const commonMakes = ["ford", "chevy", "chevrolet", "toyota", "honda", "bmw", "audi", "mercedes", "subaru", "mitsubishi", "dodge", "ram", "jeep", "nissan", "mazda", "volkswagen", "vw", "porsche"];
    const hasMake = commonMakes.some(make => lowerMessage.includes(make));
    
    if (hasVin) {
      // VIN provided
      return `Thank you for providing your VIN. Based on the vehicle information, the ${product.name} is compatible with your vehicle. This product is designed to enhance performance while maintaining reliability. Would you like installation recommendations?`;
    } else if (hasYear && hasMake) {
      // Year and make provided
      return `Based on the vehicle information you provided, the ${product.name} is compatible with your vehicle. This product is specifically designed for your application and will provide optimal performance. Would you like more details about installation or performance expectations?`;
    } else if (lowerMessage.includes("fit") || lowerMessage.includes("compatible") || lowerMessage.includes("work with")) {
      // General fitment question
      return `The ${product.name} is compatible with various vehicles. For the most accurate fitment information, please provide your vehicle's year, make, model, and engine specifications or a VIN number. This will allow me to give you specific compatibility details.`;
    } else {
      // Other product-related question
      return `The ${product.name} is a high-quality performance part designed for optimal durability and performance. To check if it's compatible with your specific vehicle, please provide your vehicle's year, make, model, and engine specifications or a VIN number.`;
    }
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
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
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
          <h2 style={{ color: '#b91c1c', marginBottom: '8px' }}>Error Loading Product</h2>
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error || "Product not found"}</p>
          <button 
            onClick={() => navigate("/products")} 
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);

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

      {/* Back Button and Breadcrumbs */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <button 
            onClick={() => navigate("/products")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#4b5563',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            Back to Products
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: '#6b7280', textDecoration: 'none' }}>Products</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/products?category=${product.category}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: '#111827' }}>{product.name}</span>
        </div>

        {/* Product Detail Layout */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Left Column - Product Images */}
          <div style={{ flex: '1' }}>
            {/* Main Image */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px'
            }}>
              <img 
                src={productImages[selectedImage] || "/placeholder.png"} 
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
                gap: '12px',
                overflowX: 'auto',
                padding: '4px',
                marginBottom: '16px'
              }}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      padding: '8px',
                      backgroundColor: 'white',
                      border: selectedImage === index 
                        ? '2px solid #2563eb' 
                        : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
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
                  </button>
                ))}
              </div>
            )}
            
            {/* Check Fitment Button */}
            <button 
              onClick={openFitmentChat}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
              Check Fitment
            </button>
          </div>
          
          {/* Right Column - Product Details */}
          <div style={{ flex: '1' }}>
            {/* Product Name */}
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#111827',
              marginBottom: '8px'
            }}>
              {product.name}
            </h1>
            
            {/* SKU */}
            {product.sku && (
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                SKU: {product.sku}
              </div>
            )}
            
            {/* Price */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              {product.discountPrice && product.discountPrice < product.price ? (
                <>
                  <span style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#059669' 
                  }}>
                    ${formatPrice(product.discountPrice)}
                  </span>
                  <span style={{ 
                    fontSize: '18px', 
                    color: '#6b7280', 
                    textDecoration: 'line-through' 
                  }}>
                    ${formatPrice(product.price)}
                  </span>
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#059669',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    Save ${formatPrice(product.price - product.discountPrice)}
                  </span>
                </>
              ) : (
                <span style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#111827' 
                }}>
                  ${formatPrice(product.price)}
                </span>
              )}
            </div>
            
            {/* Inventory Status */}
            <div style={{ marginBottom: '24px' }}>
              {product.inventory > 0 ? (
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#dcfce7',
                  color: '#059669',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '4px 12px',
                  borderRadius: '9999px'
                }}>
                  {product.inventory} in stock
                </div>
              ) : (
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '4px 12px',
                  borderRadius: '9999px'
                }}>
                  Out of stock
                </div>
              )}
            </div>
            
            {/* Product Specifications */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '12px'
              }}>
                Product Specifications
              </h3>
              <div 
                dangerouslySetInnerHTML={{ __html: formatSpecifications(product.specs) }}
                style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6'
                }}
              />
            </div>
            
            {/* Product Description */}
            {product.description && (
              <div style={{ 
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  Product Description
                </h3>
                <div 
                  dangerouslySetInnerHTML={{ __html: formatSpecifications(product.description) }}
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.6'
                  }}
                />
              </div>
            )}
            
            {/* Quantity Selector */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginRight: '16px'
              }}>
                <button 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px 0 0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    color: quantity <= 1 ? '#d1d5db' : '#374151'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
                <input 
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      setQuantity(val);
                    }
                  }}
                  style={{
                    width: '50px',
                    height: '36px',
                    border: '1px solid #d1d5db',
                    borderLeft: 'none',
                    borderRight: 'none',
                    textAlign: 'center',
                    fontSize: '14px'
                  }}
                />
                <button 
                  onClick={incrementQuantity}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0 4px 4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <button 
              disabled={product.inventory <= 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: product.inventory <= 0 ? '#d1d5db' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: product.inventory <= 0 ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            {/* Shipping and Warranty */}
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              marginBottom: '24px'
            }}>
              <button style={{
                flex: '1',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="16" height="13" x="4" y="6" rx="2"></rect>
                  <path d="m22 10-4.5 2L22 14"></path>
                  <path d="M10 6V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"></path>
                </svg>
                Shipping Info
              </button>
              <button style={{
                flex: '1',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
                Warranty
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fitment Chat Modal */}
      {showFitmentChat && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '360px',
          maxWidth: 'calc(100vw - 48px)',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          border: '1px solid #e5e7eb',
          maxHeight: '600px'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f97316',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Fitment Assistant
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  For {product.name}
                </p>
              </div>
            </div>
            <button 
              onClick={closeFitmentChat}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                color: '#6b7280'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Chat Messages */}
          <div style={{
            padding: '16px',
            overflowY: 'auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {chatMessages.map((message, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  backgroundColor: message.role === 'user' ? '#2563eb' : '#f3f4f6',
                  color: message.role === 'user' ? 'white' : '#111827',
                  padding: '12px 16px',
                  borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  maxWidth: '80%',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isSendingMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#6b7280',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#6b7280',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite 0.3s'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#6b7280',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite 0.6s'
                }}></div>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '8px'
          }}>
            <input 
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Enter VIN or vehicle details..."
              style={{
                flex: '1',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button 
              onClick={sendMessage}
              disabled={isSendingMessage || !userInput.trim()}
              style={{
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isSendingMessage || !userInput.trim() ? 'not-allowed' : 'pointer',
                opacity: isSendingMessage || !userInput.trim() ? 0.7 : 1
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"></path>
                <path d="M22 2 11 13"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
