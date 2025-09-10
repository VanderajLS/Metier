import React, { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, Heart, Star, Truck, Shield, MessageCircle, Plus, Minus } from 'lucide-react'
import ApiService from '../services/api'

const ProductDetailPage = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    if (product?.id) {
      loadRelatedProducts()
    }
  }, [product?.id])

  const loadRelatedProducts = async () => {
    try {
      const data = await ApiService.fetchRelatedProducts(product.id)
      setRelatedProducts(data.related_products || [])
    } catch (err) {
      console.error('Error loading related products:', err)
    }
  }

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change))
  }

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity })
  }

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price
  }

  const renderSpecifications = () => {
    if (!product.specs) return null
    
    return (
      <div className="space-y-3">
        {Object.entries(product.specs).map(([key, value]) => (
          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">{key}:</span>
            <span className="text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderFitment = () => {
    if (!product.fitment || product.fitment.length === 0) return null
    
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Compatible Applications:</h3>
        {product.fitment.map((fit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">
              {fit.make} {fit.model} {fit.submodel ? `${fit.submodel} ` : ''}
              ({fit.year_from}-{fit.year_to}) - {fit.engine}
            </span>
          </div>
        ))}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">i</span>
              </div>
            </div>
            <div>
              <h4 className="text-blue-900 font-medium">Fitment Verification</h4>
              <p className="text-blue-700 text-sm mt-1">
                Always verify compatibility with your specific vehicle before ordering. Contact our support team if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderKeyBenefits = () => {
    // Extract benefits from the long description or use predefined ones
    const benefits = [
      'Eliminates common turbo surge issues',
      'Improves throttle response & acceleration', 
      'Increased airflow for better power & efficiency',
      'Billet construction for strength & durability',
      'Direct-fit upgrade for easy installation'
    ]
    
    return (
      <div className="space-y-3">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <span className="text-gray-700">{benefit}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Products</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-600">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={product.images?.[0] || '/api/placeholder/600/400'} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(product.images || ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400']).slice(0, 3).map((image, index) => (
                <button key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500">
                  <img 
                    src={image} 
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{product.category}</span>
                <span className="text-sm text-gray-500">{product.sku}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{product.brand}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(product.rating || 4.8) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating || 4.8} ({product.reviews || 24} reviews)
              </span>
              <span className={`text-sm font-medium ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                {product.in_stock ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">${formatPrice(product.price)}</span>
              {product.msrp && product.msrp > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">${formatPrice(product.msrp)}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    Save ${formatPrice(product.msrp - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Product Specifications */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
              {renderSpecifications()}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                    product.in_stock 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm">Shipping Info</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Warranty</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">Ask AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'benefits', label: 'Key Benefits' },
                { id: 'compatibility', label: 'Compatibility' },
                { id: 'installation', label: 'Installation' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.long_desc || product.short_desc || 'No description available.'}
                </p>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Benefits</h3>
                {renderKeyBenefits()}
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Compatibility</h3>
                {renderFitment()}
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation Notes</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.install_notes || 'Professional installation recommended. Please consult with a qualified technician.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={relatedProduct.image} 
                    alt={relatedProduct.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{relatedProduct.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">${formatPrice(relatedProduct.price)}</span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage

