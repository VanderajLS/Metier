import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, Heart, Star, Filter, Settings } from 'lucide-react'
import ProductDetailPage from './components/ProductDetailPage'
import AdminPanel from './components/AdminPanel'
import ShoppingCartSidebar from './components/ShoppingCart'
import CheckoutPage from './components/CheckoutPage'
import ApiService from './services/api'
import MockApiService from './services/mockApi'
import './App.css'

// Use mock API for demo/testing
const API = MockApiService

function App() {
  const [currentView, setCurrentView] = useState('catalog')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutCart, setCheckoutCart] = useState(null)

  // Load initial data
  useEffect(() => {
    loadInitialData()
    loadCartCount()
  }, [])

  // Load products when search or category changes
  useEffect(() => {
    loadProducts()
  }, [searchTerm, selectedCategory])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        API.fetchProducts(),
        API.fetchCategories()
      ])
      
      setProducts(productsData.products || [])
      setCategories(categoriesData.categories || [])
      setError(null)
    } catch (err) {
      setError('Failed to load data. Please try again.')
      console.error('Error loading initial data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory
      
      const data = await API.fetchProducts(params)
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error loading products:', err)
    }
  }

  const loadCartCount = async () => {
    try {
      const data = await API.getCartCount()
      setCartCount(data.count || 0)
    } catch (err) {
      console.error('Error loading cart count:', err)
    }
  }

  const handleProductClick = async (productId) => {
    try {
      const productDetail = await API.fetchProductDetail(productId)
      setSelectedProduct(productDetail)
      setCurrentView('product-detail')
    } catch (err) {
      console.error('Error loading product detail:', err)
    }
  }

  const handleBackToProducts = () => {
    setCurrentView('catalog')
    setSelectedProduct(null)
  }

  const handleBackToStore = () => {
    setCurrentView('catalog')
    setSelectedProduct(null)
    setCheckoutCart(null)
  }

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      const data = await API.addToCart(product.id, quantity)
      setCartCount(data.cart.total_items || 0)
      // Show success message
      console.log('Added to cart:', product.title)
    } catch (err) {
      console.error('Error adding to cart:', err)
      alert(err.message || 'Failed to add to cart')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryFilter = (categorySlug) => {
    setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug)
  }

  const handleAdminAccess = () => {
    setCurrentView('admin')
  }

  const handleCartOpen = () => {
    setIsCartOpen(true)
  }

  const handleCartClose = () => {
    setIsCartOpen(false)
  }

  const handleCheckout = (cart) => {
    setCheckoutCart(cart)
    setCurrentView('checkout')
  }

  const handleOrderComplete = (order) => {
    setCurrentView('catalog')
    setCheckoutCart(null)
    setCartCount(0)
    // Show success message
    alert(`Order ${order.order_number} placed successfully!`)
  }

  if (currentView === 'admin') {
    return <AdminPanel onBack={handleBackToStore} />
  }

  if (currentView === 'checkout' && checkoutCart) {
    return (
      <CheckoutPage 
        cart={checkoutCart}
        onBack={() => setCurrentView('catalog')}
        onOrderComplete={handleOrderComplete}
      />
    )
  }

  if (currentView === 'product-detail' && selectedProduct) {
    return (
      <ProductDetailPage 
        product={selectedProduct}
        onBack={handleBackToProducts}
        onAddToCart={handleAddToCart}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shopping Cart Sidebar */}
      <ShoppingCartSidebar 
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onCheckout={handleCheckout}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Metier CX</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Products</a>
                <a href="#" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Categories</a>
                <a href="#" className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Fitment</a>
                <a href="#" className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Support</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleAdminAccess}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Admin Panel"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <User className="h-5 w-5" />
              </button>
              <button 
                onClick={handleCartOpen}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Find Your Perfect Part</h2>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by part number, vehicle, or keyword..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <span className="text-gray-600">{products.length} products found</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
              <option>Best Match</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Rating</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadInitialData}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={product.image || '/api/placeholder/300/200'} 
                    alt={product.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  />
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                  {!product.in_stock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{product.category}</span>
                    <span className="text-sm text-gray-500">{product.sku}</span>
                  </div>
                  
                  <h3 
                    className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-purple-600"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">{product.compatibility || product.model}</p>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      {product.msrp && product.msrp > product.price && (
                        <span className="text-sm text-gray-500 line-through">${product.msrp}</span>
                      )}
                    </div>
                    {product.msrp && product.msrp > product.price && (
                      <span className="text-sm text-green-600 font-medium">
                        Save ${(product.msrp - product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.in_stock}
                    className={`w-full mt-4 px-4 py-2 rounded-md font-medium transition-colors ${
                      product.in_stock 
                        ? 'bg-gray-900 text-white hover:bg-gray-800' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.in_stock ? 'Add to Cart' : 'Notify When Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Metier CX</h3>
              <p className="text-gray-400">Excellence Engineered for Performance</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Turbochargers</a></li>
                <li><a href="#" className="hover:text-white">Intercoolers</a></li>
                <li><a href="#" className="hover:text-white">Electronics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Installation Guides</a></li>
                <li><a href="#" className="hover:text-white">Technical Support</a></li>
                <li><a href="#" className="hover:text-white">Warranty</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Metier CX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

