import React, { useState, useEffect } from 'react'
import { Upload, Plus, Edit, Trash2, Search, Package, TrendingUp, AlertTriangle, FileText } from 'lucide-react'

const AdminPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [uploadStatus, setUploadStatus] = useState(null)

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats()
    } else if (activeTab === 'products') {
      loadProducts()
    }
  }, [activeTab, currentPage, searchTerm])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 20
      })
      
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`http://localhost:5000/api/admin/products?${params}`)
      const data = await response.json()
      setProducts(data.products || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event, uploadType) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadStatus({ type: 'loading', message: 'Uploading...' })
      
      const endpoint = uploadType === 'products' 
        ? 'http://localhost:5000/api/admin/upload/products'
        : 'http://localhost:5000/api/admin/upload/fitment'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: `Upload completed! Created: ${result.created}, Updated: ${result.updated || 0}`,
          errors: result.errors
        })
        
        // Refresh data
        if (activeTab === 'dashboard') loadDashboardStats()
        if (activeTab === 'products') loadProducts()
      } else {
        setUploadStatus({ type: 'error', message: result.error })
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Upload failed: ' + error.message })
    }

    // Clear file input
    event.target.value = ''
  }

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadProducts()
        setUploadStatus({ type: 'success', message: 'Product deleted successfully' })
      } else {
        const result = await response.json()
        setUploadStatus({ type: 'error', message: result.error })
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Delete failed: ' + error.message })
    }
  }

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stats?.total_products || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stats?.in_stock_products || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stats?.out_of_stock_products || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stats?.total_categories || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {(stats.recent_products || []).map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{product.title}</p>
                  <p className="text-sm text-gray-600">{product.sku}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.low_stock_products && stats.low_stock_products.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="px-6 py-4 border-b border-yellow-200">
            <h3 className="text-lg font-medium text-yellow-800">Low Stock Alert</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats.low_stock_products.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-yellow-900">{product.title}</p>
                    <p className="text-sm text-yellow-700">{product.sku}</p>
                  </div>
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                    {product.quantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatPrice(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.in_stock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.has_prev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={!pagination.has_next}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.pages}</span> ({pagination.total} total products)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.has_prev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                    disabled={!pagination.has_next}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderUpload = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Product Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="products-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload Products CSV
                </span>
                <span className="mt-1 block text-sm text-gray-600">
                  Add or update product catalog
                </span>
              </label>
              <input
                id="products-upload"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'products')}
                className="hidden"
              />
            </div>
            <button
              onClick={() => document.getElementById('products-upload').click()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Choose File
            </button>
          </div>

          {/* Fitment Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="fitment-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload Fitment CSV
                </span>
                <span className="mt-1 block text-sm text-gray-600">
                  Add vehicle compatibility data
                </span>
              </label>
              <input
                id="fitment-upload"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'fitment')}
                className="hidden"
              />
            </div>
            <button
              onClick={() => document.getElementById('fitment-upload').click()}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Choose File
            </button>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className={`mt-6 p-4 rounded-md ${
            uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
            uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`font-medium ${
              uploadStatus.type === 'success' ? 'text-green-800' :
              uploadStatus.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {uploadStatus.message}
            </p>
            {uploadStatus.errors && uploadStatus.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-red-700 font-medium">Errors:</p>
                <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                  {uploadStatus.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {uploadStatus.errors.length > 5 && (
                    <li>... and {uploadStatus.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* CSV Format Help */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">CSV Format Requirements</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Products CSV:</strong> sku, title, brand, category, price, msrp, quantity, in_stock, short_desc, long_desc</p>
            <p><strong>Fitment CSV:</strong> product_sku, make, model, submodel, year_from, year_to, engine, notes</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Store
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'products', label: 'Products' },
              { id: 'upload', label: 'Upload Data' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}
        
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'products' && renderProducts()}
        {!loading && activeTab === 'upload' && renderUpload()}
      </div>
    </div>
  )
}

export default AdminPanel

