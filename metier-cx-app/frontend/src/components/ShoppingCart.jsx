import React, { useState, useEffect } from 'react'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import MockApiService from '../services/mockApi'

const ShoppingCart = ({ isOpen, onClose, onCheckout }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadCart()
    }
  }, [isOpen])

  const loadCart = async () => {
    try {
      setLoading(true)
      const data = await MockApiService.getCart()
      setCart(data.cart)
      setError(null)
    } catch (err) {
      setError('Failed to load cart')
      console.error('Error loading cart:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const data = await MockApiService.updateCartItem(itemId, newQuantity)
      setCart(data.cart)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to update cart')
      console.error('Error updating cart:', err)
    }
  }

  const removeItem = async (itemId) => {
    try {
      const data = await MockApiService.removeFromCart(itemId)
      setCart(data.cart)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to remove item')
      console.error('Error removing item:', err)
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      const data = await MockApiService.clearCart()
      setCart(data.cart)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to clear cart')
      console.error('Error clearing cart:', err)
    }
  }

  const handleCheckout = () => {
    if (cart && cart.items && cart.items.length > 0) {
      onCheckout(cart)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              {cart && cart.total_items > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                  {cart.total_items}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadCart}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Try Again
                </button>
              </div>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <ShoppingBag className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-sm">Add some products to get started</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                    <img
                      src={item.product?.image || '/api/placeholder/80/80'}
                      alt={item.product?.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.product?.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.product?.brand} • {item.product?.sku}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ${item.price.toFixed(2)} each
                      </p>
                      
                      {!item.product?.in_stock && (
                        <p className="text-xs text-red-600 mt-1">Out of stock</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={item.quantity >= (item.product?.quantity_available || 0)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${item.subtotal.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-xs flex items-center space-x-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Clear Cart Button */}
                {cart.items.length > 0 && (
                  <div className="pt-4">
                    <button
                      onClick={clearCart}
                      className="text-sm text-gray-600 hover:text-red-600 flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear Cart</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="border-t bg-gray-50 p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span>${cart.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{cart.total_amount >= 500 ? 'FREE' : '$25.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (estimated)</span>
                  <span>${(cart.total_amount * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      ${(cart.total_amount + (cart.total_amount >= 500 ? 0 : 25) + (cart.total_amount * 0.08)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 font-medium"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={onClose}
                className="w-full mt-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShoppingCart

