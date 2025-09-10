// Mock API service for testing without backend
class MockApiService {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('mockCart')) || { items: [], total_items: 0, total_amount: 0 }
    this.orderCounter = parseInt(localStorage.getItem('mockOrderCounter')) || 1
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('mockCart', JSON.stringify(this.cart))
  }

  // Mock product data
  getMockProducts() {
    return [
      {
        id: 1,
        sku: 'MP17029',
        title: 'Compressor Wheel (Wicked Wheel)',
        brand: 'Métier',
        category: 'Turbocharger Components',
        price: 299,
        msrp: 349,
        rating: 4.5,
        reviews: 15,
        in_stock: true,
        quantity: 12,
        image: '/api/placeholder/300/200',
        compatibility: 'Ford Powerstroke 7.3L (1994.5–2003)',
        model: 'GTP38',
        description: 'This is an upgraded billet compressor wheel (wicked wheel style) designed for the Garrett GTP38 turbocharger, widely used in Ford Powerstroke 7.3L diesel engines.',
        specifications: {
          'Part Number': 'MP17029',
          'OE Reference': '170293',
          'Model Compatibility': 'GTP38',
          'Material': 'Billet Aluminum',
          'Finish': 'Machined',
          'Weight': '0.8 lbs',
          'Warranty': '2 Years'
        },
        fitment: [
          { year: '1994-2003', make: 'Ford', model: 'F-250 Super Duty', engine: '7.3L Powerstroke' },
          { year: '1994-2003', make: 'Ford', model: 'F-350 Super Duty', engine: '7.3L Powerstroke' }
        ]
      },
      {
        id: 2,
        sku: 'MET-7811',
        title: 'GTX 2867R Turbocharger',
        brand: 'Métier',
        category: 'Turbochargers',
        price: 899,
        msrp: 999,
        rating: 4.5,
        reviews: 15,
        in_stock: true,
        quantity: 8,
        image: '/api/placeholder/300/200',
        compatibility: 'Subaru WRX STI 2015-2018',
        model: 'GTX 2867R',
        description: 'High-performance turbocharger designed for maximum power and reliability.',
        specifications: {
          'Part Number': 'MET-7811',
          'Compressor Wheel': '67mm',
          'Turbine Wheel': '62mm',
          'A/R Ratio': '0.64',
          'Max HP': '450HP',
          'Material': 'Inconel',
          'Warranty': '2 Years'
        },
        fitment: [
          { year: '2015-2018', make: 'Subaru', model: 'WRX STI', engine: '2.5L H4' }
        ]
      },
      {
        id: 3,
        sku: 'MET-5432',
        title: '500HP Intercooler Kit',
        brand: 'Métier',
        category: 'Intercoolers',
        price: 549,
        msrp: 599,
        rating: 4.5,
        reviews: 15,
        in_stock: false,
        quantity: 0,
        image: '/api/placeholder/300/200',
        compatibility: 'Subaru WRX 2015-2021',
        model: 'Front Mount',
        description: 'High-efficiency front-mount intercooler kit for maximum cooling performance.',
        specifications: {
          'Part Number': 'MET-5432',
          'Core Size': '24" x 12" x 3.5"',
          'End Tank': 'Cast Aluminum',
          'Piping': '2.5" Aluminum',
          'Max HP': '500HP',
          'Finish': 'Black Powder Coat',
          'Warranty': '2 Years'
        },
        fitment: [
          { year: '2015-2021', make: 'Subaru', model: 'WRX', engine: '2.0L H4' }
        ]
      },
      {
        id: 4,
        sku: 'MET-9876',
        title: 'Electronic Boost Controller',
        brand: 'Métier',
        category: 'Electronics',
        price: 359,
        msrp: 399,
        rating: 4.5,
        reviews: 15,
        in_stock: false,
        quantity: 0,
        image: '/api/placeholder/300/200',
        compatibility: 'Universal Application',
        model: 'EBC-Pro',
        description: 'Advanced electronic boost controller with smartphone connectivity.',
        specifications: {
          'Part Number': 'MET-9876',
          'Display': '3.5" Color LCD',
          'Connectivity': 'Bluetooth/WiFi',
          'Channels': '4 Input / 2 Output',
          'Operating Temp': '-40°F to 185°F',
          'Power': '12V DC',
          'Warranty': '3 Years'
        },
        fitment: [
          { year: 'Universal', make: 'Universal', model: 'Universal', engine: 'Turbocharged' }
        ]
      },
      {
        id: 5,
        sku: 'MET-3344',
        title: 'Cold Air Intake System',
        brand: 'Métier',
        category: 'Intake Systems',
        price: 299,
        msrp: 349,
        rating: 4.5,
        reviews: 15,
        in_stock: true,
        quantity: 15,
        image: '/api/placeholder/300/200',
        compatibility: 'Subaru WRX 2015-2021',
        model: 'CAI-Pro',
        description: 'High-flow cold air intake system for improved performance and sound.',
        specifications: {
          'Part Number': 'MET-3344',
          'Filter': 'High-Flow Cotton',
          'Piping': '3" Aluminum',
          'Heat Shield': 'Carbon Fiber',
          'Finish': 'Polished Aluminum',
          'HP Gain': '+15-20HP',
          'Warranty': '2 Years'
        },
        fitment: [
          { year: '2015-2021', make: 'Subaru', model: 'WRX', engine: '2.0L H4' }
        ]
      }
    ]
  }

  getMockCategories() {
    return [
      { id: 1, name: 'Electronics', slug: 'electronics' },
      { id: 2, name: 'Exhaust Systems', slug: 'exhaust-systems' },
      { id: 3, name: 'Intake Systems', slug: 'intake-systems' },
      { id: 4, name: 'Intercoolers', slug: 'intercoolers' },
      { id: 5, name: 'Turbocharger Components', slug: 'turbocharger-components' },
      { id: 6, name: 'Turbochargers', slug: 'turbochargers' }
    ]
  }

  // Mock API methods
  async fetchProducts(params = {}) {
    await this.delay(300) // Simulate network delay
    
    let products = this.getMockProducts()
    
    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      products = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.compatibility.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply category filter
    if (params.category) {
      products = products.filter(product => 
        product.category.toLowerCase().replace(/\s+/g, '-') === params.category
      )
    }
    
    return { products }
  }

  async fetchProductDetail(productId) {
    await this.delay(200)
    const products = this.getMockProducts()
    const product = products.find(p => p.id === parseInt(productId))
    if (!product) throw new Error('Product not found')
    return product
  }

  async fetchCategories() {
    await this.delay(100)
    return { categories: this.getMockCategories() }
  }

  // Cart methods
  async getCart() {
    await this.delay(100)
    return {
      cart: {
        ...this.cart,
        items: this.cart.items.map(item => ({
          ...item,
          product: this.getMockProducts().find(p => p.id === item.product_id)
        }))
      }
    }
  }

  async addToCart(productId, quantity = 1) {
    await this.delay(200)
    
    const product = this.getMockProducts().find(p => p.id === productId)
    if (!product) throw new Error('Product not found')
    if (!product.in_stock) throw new Error('Product is out of stock')
    
    const existingItem = this.cart.items.find(item => item.product_id === productId)
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > product.quantity) {
        throw new Error(`Only ${product.quantity} items available`)
      }
      existingItem.quantity = newQuantity
      existingItem.subtotal = existingItem.price * newQuantity
    } else {
      const newItem = {
        id: Date.now(),
        product_id: productId,
        quantity,
        price: product.price,
        subtotal: product.price * quantity
      }
      this.cart.items.push(newItem)
    }
    
    this.updateCartTotals()
    this.saveCart()
    
    return {
      cart: {
        ...this.cart,
        items: this.cart.items.map(item => ({
          ...item,
          product: this.getMockProducts().find(p => p.id === item.product_id)
        }))
      }
    }
  }

  async updateCartItem(itemId, quantity) {
    await this.delay(200)
    
    const item = this.cart.items.find(i => i.id === itemId)
    if (!item) throw new Error('Cart item not found')
    
    if (quantity === 0) {
      this.cart.items = this.cart.items.filter(i => i.id !== itemId)
    } else {
      const product = this.getMockProducts().find(p => p.id === item.product_id)
      if (quantity > product.quantity) {
        throw new Error(`Only ${product.quantity} items available`)
      }
      item.quantity = quantity
      item.subtotal = item.price * quantity
    }
    
    this.updateCartTotals()
    this.saveCart()
    
    return {
      cart: {
        ...this.cart,
        items: this.cart.items.map(item => ({
          ...item,
          product: this.getMockProducts().find(p => p.id === item.product_id)
        }))
      }
    }
  }

  async removeFromCart(itemId) {
    await this.delay(200)
    
    this.cart.items = this.cart.items.filter(i => i.id !== itemId)
    this.updateCartTotals()
    this.saveCart()
    
    return {
      cart: {
        ...this.cart,
        items: this.cart.items.map(item => ({
          ...item,
          product: this.getMockProducts().find(p => p.id === item.product_id)
        }))
      }
    }
  }

  async clearCart() {
    await this.delay(200)
    
    this.cart.items = []
    this.updateCartTotals()
    this.saveCart()
    
    return { cart: this.cart }
  }

  async getCartCount() {
    return { count: this.cart.total_items }
  }

  // Order methods
  async createOrder(orderData) {
    await this.delay(1000) // Simulate processing time
    
    if (this.cart.items.length === 0) {
      throw new Error('Cart is empty')
    }
    
    const orderNumber = `MET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.orderCounter).padStart(4, '0')}`
    
    const subtotal = this.cart.total_amount
    const tax_amount = subtotal * 0.08
    const shipping_amount = subtotal >= 500 ? 0 : 25
    const total_amount = subtotal + tax_amount + shipping_amount
    
    const order = {
      id: Date.now(),
      order_number: orderNumber,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      billing_address: {
        line1: orderData.billing_address_line1,
        line2: orderData.billing_address_line2,
        city: orderData.billing_city,
        state: orderData.billing_state,
        zip: orderData.billing_zip,
        country: orderData.billing_country || 'US'
      },
      shipping_address: {
        line1: orderData.shipping_address_line1,
        line2: orderData.shipping_address_line2,
        city: orderData.shipping_city,
        state: orderData.shipping_state,
        zip: orderData.shipping_zip,
        country: orderData.shipping_country || 'US'
      },
      subtotal,
      tax_amount,
      shipping_amount,
      total_amount,
      status: 'pending',
      payment_status: 'pending',
      items: [...this.cart.items],
      created_at: new Date().toISOString()
    }
    
    // Clear cart after order
    this.cart.items = []
    this.updateCartTotals()
    this.saveCart()
    
    // Increment order counter
    this.orderCounter++
    localStorage.setItem('mockOrderCounter', this.orderCounter.toString())
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('mockOrders')) || []
    orders.push(order)
    localStorage.setItem('mockOrders', JSON.stringify(orders))
    
    return { order }
  }

  async confirmPayment(orderNumber) {
    await this.delay(500)
    
    const orders = JSON.parse(localStorage.getItem('mockOrders')) || []
    const order = orders.find(o => o.order_number === orderNumber)
    
    if (order) {
      order.payment_status = 'paid'
      order.status = 'confirmed'
      localStorage.setItem('mockOrders', JSON.stringify(orders))
    }
    
    return { order }
  }

  // Helper methods
  updateCartTotals() {
    this.cart.total_items = this.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    this.cart.total_amount = this.cart.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new MockApiService()

