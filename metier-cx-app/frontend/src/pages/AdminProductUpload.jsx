import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminProductUpload() {
  const navigate = useNavigate();
  const [infoFile, setInfoFile] = useState(null);
  const [productFiles, setProductFiles] = useState([]);
  const [previewInfo, setPreviewInfo] = useState("");
  const [previewProducts, setPreviewProducts] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0); // Track which image is the main one
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
  const [msgType, setMsgType] = useState("info"); // success, error, info
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: Images, 2: Details, 3: Review
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api.metierturbo.com";

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
      setPreviewProducts(urls);
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

  // --- Save product ---
  async function handleSave(e) {
    e.preventDefault();
    
    // Validation
    if (!fields.name || !fields.price || !fields.category) {
      showMessage("Please fill in all required fields (Name, Price, Category).", "error");
      return;
    }

    try {
      setBusy(true);
      showMessage("Saving product...", "info");
      
      // Reorder product images to put the main image first
      let orderedImages = [...previewProducts];
      if (orderedImages.length > 0 && mainImageIndex < orderedImages.length) {
        // Move the main image to the front
        const mainImage = orderedImages[mainImageIndex];
        orderedImages.splice(mainImageIndex, 1);
        orderedImages.unshift(mainImage);
      }
      
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          product_images: orderedImages, // Use the reordered images
        }),
      });
      if (!res.ok) throw new Error("Failed to save product");
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (e) {
      showMessage(`Save failed: ${e.message}`, "error");
      setBusy(false);
    }
  }

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Reset form
    setFields({
      name: "",
      sku: "",
      category: "",
      price: "",
      discountPrice: "",
      inventory: "",
      specs: "",
      description: "",
      image_url: "",
    });
    setInfoFile(null);
    setProductFiles([]);
    setPreviewInfo("");
    setPreviewProducts([]);
    setFeedback("");
    setCurrentStep(1);
    setMainImageIndex(0);
    setBusy(false);
  };

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
                Metier Turbo Admin
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
                    color: '#3b82f6', 
                    textDecoration: 'none', 
                    fontWeight: '500' 
                  }}
                >
                  Product Upload
                </Link>
              </div>
            </div>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              ✓ MODERN UI
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1e293b', 
            margin: '0 0 8px 0' 
          }}>
            Upload New Product
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
            Add a new product to your catalog with AI-powered content generation
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
                  color: currentStep >= item.step ? '#64748b' : '#94a3b8',
                  fontSize: '12px'
                }}>
                  {item.desc}
                </div>
              </div>
              {index < 2 && (
                <div style={{ 
                  height: '2px', 
                  flex: '0.5', 
                  backgroundColor: currentStep > item.step ? '#3b82f6' : '#e2e8f0',
                  margin: '0 8px'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Message Display */}
        {msg && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            backgroundColor: 
              msgType === 'success' ? '#dcfce7' : 
              msgType === 'error' ? '#fee2e2' : 
              '#dbeafe',
            color: 
              msgType === 'success' ? '#166534' : 
              msgType === 'error' ? '#991b1b' : 
              '#1e40af',
            border: 
              msgType === 'success' ? '1px solid #bbf7d0' : 
              msgType === 'error' ? '1px solid #fecaca' : 
              '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontWeight: '600' }}>
              {msgType === 'success' ? '✓' : msgType === 'error' ? '✗' : 'ℹ'}
            </span>
            {msg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            {/* Step 1: Images */}
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1e293b', 
                marginTop: 0,
                marginBottom: '24px'
              }}>
                Upload Product Images
              </h2>

              {/* Description Image Upload */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#334155', 
                  marginBottom: '12px' 
                }}>
                  AI Description Image
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  This image is used only for AI to generate product details. It will not be displayed in the product gallery.
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setInfoFile(e.target.files[0])}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
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
                      borderRadius: '8px',
                      cursor: !infoFile || busy ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Upload AI Description Image
                  </button>
                  {previewInfo && (
                    <div style={{ marginTop: '16px' }}>
                      <img
                        src={previewInfo}
                        alt="Description"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px',
                          backgroundColor: '#f8fafc'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Gallery Upload */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#334155', 
                  marginBottom: '12px' 
                }}>
                  Product Gallery Images
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  These images will be displayed in the product gallery. Select a main image to be displayed as the primary product image.
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setProductFiles(Array.from(e.target.files))}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleProductUploads}
                    disabled={!productFiles.length || busy}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: !productFiles.length || busy ? '#e5e7eb' : '#3b82f6',
                      color: !productFiles.length || busy ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: !productFiles.length || busy ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Upload Gallery Images
                  </button>
                  
                  {/* Gallery Images with Main Image Selection */}
                  {previewProducts.length > 0 && (
                    <div style={{ width: '100%', marginTop: '16px' }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#334155', 
                        marginBottom: '8px' 
                      }}>
                        Select Main Product Image:
                      </h4>
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        {previewProducts.map((url, i) => (
                          <div 
                            key={i}
                            onClick={() => setMainImageIndex(i)}
                            style={{
                              position: 'relative',
                              width: '100px',
                              height: '100px',
                              border: mainImageIndex === i ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '4px',
                              cursor: 'pointer',
                              backgroundColor: mainImageIndex === i ? '#eff6ff' : '#f8fafc'
                            }}
                          >
                            <img
                              src={url}
                              alt={`Product ${i + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                            {mainImageIndex === i && (
                              <div style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '12px',
                        marginTop: '8px'
                      }}>
                        Click on an image to set it as the main product image. The main image will be displayed first in the product gallery.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Description Button */}
              <div style={{ 
                backgroundColor: '#f0f9ff', 
                border: '1px solid #bae6fd', 
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#0369a1', 
                  marginTop: 0,
                  marginBottom: '8px' 
                }}>
                  Generate Product Details with AI
                </h3>
                <p style={{ 
                  color: '#0c4a6e', 
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  Upload a main product image and click below to automatically generate product details using AI.
                </p>
                <button
                  type="button"
                  onClick={handleDescribe}
                  disabled={!fields.image_url || busy}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: !fields.image_url || busy ? '#e5e7eb' : '#0ea5e9',
                    color: !fields.image_url || busy ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !fields.image_url || busy ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
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
                      Processing...
                    </>
                  ) : (
                    <>✨ Generate with AI</>
                  )}
                </button>
              </div>

              {/* Navigation Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <div></div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Continue to Details
                </button>
              </div>
            </div>

            {/* Step 2: Product Details */}
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1e293b', 
                marginTop: 0,
                marginBottom: '24px'
              }}>
                Product Details
              </h2>

              {/* Basic Info */}
              <div style={{ marginBottom: '24px' }}>
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

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '24px'
              }}>
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
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '24px'
              }}>
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
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '12px',
                  marginTop: '8px'
                }}>
                  Use **bold text** for specification labels. Each specification should be on a new line.
                </p>
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
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '12px',
                  marginTop: '8px'
                }}>
                  Use **bold text** for emphasis. Paragraphs should be separated by blank lines.
                </p>
              </div>

              {/* Navigation Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#64748b',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Back to Images
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Continue to Review
                </button>
              </div>
            </div>

            {/* Step 3: Review & Save */}
            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1e293b', 
                marginTop: 0,
                marginBottom: '24px'
              }}>
                Review & Save
              </h2>

              {/* Preview */}
              <div style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '24px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ 
                      width: '200px', 
                      height: '200px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img
                        src={previewProducts[mainImageIndex] || "/placeholder.png"}
                        alt="Product"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#1e293b', 
                        marginTop: 0,
                        marginBottom: '8px'
                      }}>
                        {fields.name || "Unnamed Product"}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {fields.category || "Uncategorized"}
                        </span>
                        {fields.sku && (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            SKU: {fields.sku}
                          </span>
                        )}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        {fields.discountPrice ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>
                              ${parseFloat(fields.discountPrice).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '16px', color: '#64748b', textDecoration: 'line-through' }}>
                              ${parseFloat(fields.price).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
                            ${parseFloat(fields.price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#475569' }}>
                        {fields.inventory ? `${fields.inventory} in stock` : "No stock information"}
                      </div>
                    </div>
                  </div>

                  {/* Gallery Preview */}
                  {previewProducts.length > 0 && (
                    <div>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#475569', 
                        marginBottom: '8px' 
                      }}>
                        Gallery Images ({previewProducts.length})
                      </h4>
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {previewProducts.map((url, i) => (
                          <div 
                            key={i}
                            style={{
                              position: 'relative',
                              width: '60px',
                              height: '60px',
                              border: mainImageIndex === i ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={url}
                              alt={`Product ${i + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            {mainImageIndex === i && (
                              <div style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                fontSize: '10px',
                                padding: '2px 4px'
                              }}>
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specs Preview */}
                  {fields.specs && (
                    <div>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#475569', 
                        marginBottom: '8px' 
                      }}>
                        Specifications
                      </h4>
                      <div style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '14px',
                        color: '#475569',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {fields.specs}
                      </div>
                    </div>
                  )}

                  {/* Description Preview */}
                  {fields.description && (
                    <div>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#475569', 
                        marginBottom: '8px' 
                      }}>
                        Description
                      </h4>
                      <div style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '14px',
                        color: '#475569',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {fields.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Feedback */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '6px' 
                }}>
                  AI Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was the AI-generated content? Any suggestions for improvement?"
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

              {/* Save Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                gap: '12px',
                paddingTop: '24px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#64748b',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Back to Details
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
                      Saving...
                    </>
                  ) : (
                    <>💾 Save Product</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
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
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <span style={{ fontSize: '32px', color: '#059669' }}>✓</span>
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              Product Saved Successfully!
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#4b5563',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              Your product has been added to the catalog and is now available for customers to view.
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  handleSuccessModalClose();
                  navigate('/products');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                View Products
              </button>
              <button
                onClick={handleSuccessModalClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Add Another Product
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
