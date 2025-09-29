import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function AdminProductUpload() {
  const { productId } = useParams(); // Get product ID from URL for editing
  const navigate = useNavigate();
  const isEditing = !!productId;

  const [infoFile, setInfoFile] = useState(null);
  const [productFiles, setProductFiles] = useState([]);
  const [previewInfo, setPreviewInfo] = useState("");
  const [previewProducts, setPreviewProducts] = useState([]);
  const [fields, setFields] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    discountPrice: "",
    inventory: "",
    specs: "",
    description: "",
    image_url: ""
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

  // Load product data if editing
  useEffect(() => {
    if (isEditing && productId) {
      loadProductForEdit();
    }
  }, [productId, isEditing]);

  const loadProductForEdit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/products/${productId}`);
      if (!res.ok) throw new Error("Failed to load product");
      
      const product = await res.json();
      
      // Populate form fields
      setFields({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        price: product.price?.toString() || "",
        discountPrice: product.discountPrice?.toString() || "",
        inventory: product.inventory?.toString() || "",
        specs: product.specs || "",
        description: product.description || "",
        image_url: product.image_url || ""
      });

      // Set preview images
      if (product.image_url) {
        setPreviewInfo(product.image_url);
      }
      if (product.product_images && product.product_images.length > 0) {
        setPreviewProducts(product.product_images);
      }

      setCurrentStep(2); // Skip to details step since images are already loaded
      showMessage(`Loaded product "${product.name}" for editing`, "success");
    } catch (e) {
      showMessage(`Failed to load product: ${e.message}`, "error");
      navigate("/products"); // Redirect back if product not found
    } finally {
      setLoading(false);
    }
  };

  // Helper to show messages with types
  const showMessage = (message, type = "info") => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(""), 5000);
  };

  // --- Helpers ---
  async function presignAndUpload(file, folder) {
    const presignRes = await fetch(`${API_BASE}/api/admin/images/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        folder,
      }),
    });
    if (!presignRes.ok) throw new Error("Presign request failed");
    const { upload_url, public_url } = await presignRes.json();

    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");

    return public_url;
  }

  // --- Upload description image ---
  async function handleInfoUpload() {
    if (!infoFile) return;
    try {
      setBusy(true);
      showMessage("Uploading description image...", "info");
      const url = await presignAndUpload(infoFile, "products/info");
      setPreviewInfo(url);
      setFields((f) => ({ ...f, image_url: url }));
      showMessage("Description image uploaded successfully!", "success");
    } catch (e) {
      showMessage(`Upload failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  // --- Upload product gallery images ---
  async function handleProductUploads() {
    if (!productFiles.length) return;
    try {
      setBusy(true);
      showMessage("Uploading product images...", "info");
      const urls = [];
      for (const file of productFiles) {
        const url = await presignAndUpload(file, "products/images");
        urls.push(url);
      }
      setPreviewProducts([...previewProducts, ...urls]); // Append to existing images
      showMessage("Product images uploaded successfully!", "success");
    } catch (e) {
      showMessage(`Upload failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  // --- Generate fields with AI ---
  async function handleDescribe() {
    if (!fields.image_url) {
      showMessage("Please upload a description image first.", "error");
      return;
    }
    try {
      setBusy(true);
      showMessage("Analyzing image with AI...", "info");

      const res = await fetch(`${API_BASE}/api/admin/ai/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: fields.image_url,
          price: fields.price || "",
          inventory: fields.inventory || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "AI analysis failed");

      setFields((f) => ({
        ...f,
        name: data.name ?? f.name,
        category: data.category ?? f.category,
        sku: data.sku ?? f.sku,
        specs: data.specs ?? f.specs,
        description: data.description || f.description,
        price: data.price ?? f.price,
        inventory: data.inventory ?? f.inventory,
      }));

      showMessage("AI analysis complete! Please review and edit the generated details.", "success");
      setCurrentStep(2);
    } catch (e) {
      showMessage(`AI analysis failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  // --- Save or Update product ---
  async function handleSave(e) {
    e.preventDefault();
    
    // Validation
    if (!fields.name || !fields.price || !fields.category) {
      showMessage("Please fill in all required fields (Name, Price, Category).", "error");
      return;
    }

    try {
      setBusy(true);
      showMessage(isEditing ? "Updating product..." : "Saving product...", "info");
      
      const url = isEditing 
        ? `${API_BASE}/api/admin/products/${productId}`
        : `${API_BASE}/api/admin/products`;
      
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          product_images: previewProducts,
        }),
      });
      
      if (!res.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'save'} product`);
      
      showMessage(
        isEditing 
          ? "Product updated successfully!" 
          : "Product saved successfully! Check the catalog.", 
        "success"
      );
      
      // Navigate back to products after successful save/update
      setTimeout(() => {
        navigate("/products");
      }, 1500);
      
    } catch (e) {
      showMessage(`${isEditing ? 'Update' : 'Save'} failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  // Handle cancel - go back to products
  const handleCancel = () => {
    navigate("/products");
  };

  // Remove image from gallery
  const removeGalleryImage = (index) => {
    setPreviewProducts(previewProducts.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  // --- UI ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header Navigation */}
      <nav style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        borderBottom: '1px solid #e2e8f0' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                Metier CX Admin
              </h2>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Link 
                  to="/products" 
                  style={{ 
                    color: '#64748b', 
                    textDecoration: 'none', 
                    fontWeight: '500',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.target.style.color = '#64748b'}
                >
                  View Products
                </Link>
                <Link 
                  to="/admin" 
                  style={{ 
                    color: isEditing ? '#64748b' : '#3b82f6', 
                    textDecoration: 'none', 
                    fontWeight: '500' 
                  }}
                >
                  Product Upload
                </Link>
              </div>
            </div>
            <span style={{
              backgroundColor: isEditing ? '#fef3c7' : '#dbeafe',
              color: isEditing ? '#92400e' : '#1d4ed8',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {isEditing ? '✏️ EDITING MODE' : '✓ MODERN UI'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ← Back to Products
            </button>
          </div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1e293b', 
            margin: '0 0 8px 0' 
          }}>
            {isEditing ? `Edit Product: ${fields.name || 'Loading...'}` : 'Upload New Product'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
            {isEditing 
              ? 'Update product information and save changes'
              : 'Add a new product to your catalog with AI-powered content generation'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '40px',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {[
            { step: 1, title: 'Upload Images', desc: 'Add product photos' },
            { step: 2, title: 'Product Details', desc: 'Fill in information' },
            { step: 3, title: 'Review & Save', desc: 'Confirm and publish' }
          ].map((item, index) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: currentStep >= item.step ? '#3b82f6' : '#e2e8f0',
                color: currentStep >= item.step ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {item.step}
              </div>
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: currentStep >= item.step ? '#1e293b' : '#64748b',
                  fontSize: '14px'
                }}>
                  {item.title}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#64748b' 
                }}>
                  {item.desc}
                </div>
              </div>
              {index < 2 && (
                <div style={{
                  height: '2px',
                  backgroundColor: currentStep > item.step ? '#3b82f6' : '#e2e8f0',
                  flex: 1,
                  marginLeft: '16px'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Message Display */}
        {msg && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            backgroundColor: msgType === 'success' ? '#f0fdf4' : msgType === 'error' ? '#fef2f2' : '#f0f9ff',
            border: `1px solid ${msgType === 'success' ? '#bbf7d0' : msgType === 'error' ? '#fecaca' : '#bae6fd'}`,
            color: msgType === 'success' ? '#166534' : msgType === 'error' ? '#dc2626' : '#0369a1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                {msgType === 'success' ? '✅' : msgType === 'error' ? '❌' : 'ℹ️'}
              </span>
              {msg}
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gap: '24px' }}>
            
            {/* Step 1: Image Upload */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1e293b', 
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📸 Product Images
              </h3>

              {/* Description Image */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Main Description Image *
                </label>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginBottom: '12px' 
                }}>
                  {isEditing ? 'Update the primary product image' : 'Upload the primary product image for AI analysis and description generation'}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setInfoFile(e.target.files?.[0] || null)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleInfoUpload} 
                    disabled={!infoFile || busy}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: !infoFile || busy ? '#e5e7eb' : '#3b82f6',
                      color: !infoFile || busy ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: !infoFile || busy ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {busy ? 'Uploading...' : 'Upload'}
                  </button>
                </div>

                {previewInfo && (
                  <div style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    padding: '16px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <img
                      src={previewInfo}
                      alt="Description preview"
                      style={{ 
                        maxWidth: '300px', 
                        maxHeight: '200px', 
                        objectFit: 'contain',
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Product Gallery */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Product Gallery Images
                </label>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginBottom: '12px' 
                }}>
                  {isEditing ? 'Add more product images to the gallery' : 'Upload additional product images for the gallery (optional)'}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setProductFiles(Array.from(e.target.files || []))}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleProductUploads}
                    disabled={!productFiles.length || busy}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: !productFiles.length || busy ? '#e5e7eb' : '#10b981',
                      color: !productFiles.length || busy ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: !productFiles.length || busy ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {busy ? 'Uploading...' : 'Upload Gallery'}
                  </button>
                </div>

                {previewProducts.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {previewProducts.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img 
                          src={url} 
                          alt={`Gallery ${i + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }} 
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Generate Button - Only show if not editing or if no content exists */}
              {(!isEditing || !fields.name) && (
                <div style={{ 
                  padding: '20px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1e293b', 
                    margin: '0 0 8px 0' 
                  }}>
                    🤖 AI Content Generation
                  </h4>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#64748b', 
                    marginBottom: '16px' 
                  }}>
                    Let AI analyze your product image and generate name, description, specifications, and other details automatically.
                  </p>
                  <button
                    type="button"
                    onClick={handleDescribe}
                    disabled={busy || !fields.image_url}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: busy || !fields.image_url ? '#e5e7eb' : '#8b5cf6',
                      color: busy || !fields.image_url ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: busy || !fields.image_url ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {busy ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid currentColor',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Analyzing...
                      </>
                    ) : (
                      <>🚀 Generate with AI</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Product Details */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1e293b', 
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📝 Product Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Basic Info */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={fields.name}
                    onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Enter product name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    SKU
                  </label>
                  <input
                    type="text"
                    value={fields.sku}
                    onChange={(e) => setFields((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="Product SKU"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Category *
                  </label>
                  <input
                    type="text"
                    value={fields.category}
                    onChange={(e) => setFields((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Product category"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Inventory
                  </label>
                  <input
                    type="number"
                    value={fields.inventory}
                    onChange={(e) => setFields((f) => ({ ...f, inventory: e.target.value }))}
                    placeholder="Stock quantity"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Standard Price * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fields.price}
                    onChange={(e) => setFields((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Discount Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fields.discountPrice}
                    onChange={(e) => setFields((f) => ({ ...f, discountPrice: e.target.value }))}
                    placeholder="Optional sale price"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '6px' 
                }}>
                  Specifications
                </label>
                <textarea
                  value={fields.specs}
                  onChange={(e) => setFields((f) => ({ ...f, specs: e.target.value }))}
                  placeholder="Product specifications (supports Markdown formatting)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '6px' 
                }}>
                  Description
                </label>
                <textarea
                  value={fields.description}
                  onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detailed product description (supports Markdown formatting)"
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Step 3: Admin Feedback - Only show for new products */}
            {!isEditing && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💬 Admin Feedback
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  marginBottom: '16px' 
                }}>
                  Provide feedback for future AI improvements (optional)
                </p>
                
                <textarea
                  placeholder="Suggest corrections or improvements for AI-generated content..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af', 
                  marginTop: '8px' 
                }}>
                  This feedback will be used to improve future AI content generation
                </p>
              </div>
            )}

            {/* Save Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#64748b',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={busy}
                style={{
                  padding: '12px 32px',
                  backgroundColor: busy ? '#e5e7eb' : '#059669',
                  color: busy ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {busy ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>{isEditing ? '💾 Update Product' : '💾 Save Product'}</>
                )}
              </button>
            </div>
          </div>
        </form>
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
