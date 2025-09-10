# Metier CX - Automotive Parts E-commerce Platform

> **Excellence Engineered for Performance**

A complete, professional e-commerce platform for automotive parts and performance components. Built with React frontend and Flask backend, featuring product catalog, shopping cart, checkout, order management, and admin panel.

![Metier CX Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Flask](https://img.shields.io/badge/Backend-Flask-green)
![Database](https://img.shields.io/badge/Database-SQLite%2FPostgreSQL-orange)

## 🚀 Live Demo

- **Frontend Demo**: [View Live App](https://your-deployed-url.com)
- **Admin Panel**: Access via settings icon in the app
- **Test Data**: Pre-loaded with automotive parts catalog

## ✨ Features

### Customer Features
- 🔍 **Advanced Search**: Search by part number, vehicle, or keyword
- 📱 **Responsive Design**: Perfect on desktop, tablet, and mobile
- 🛒 **Shopping Cart**: Real-time cart management with quantity controls
- 💳 **Secure Checkout**: Multi-step checkout with order confirmation
- 📋 **Product Details**: Comprehensive specifications and fitment data
- 🚗 **Vehicle Compatibility**: Year/Make/Model/Engine fitment information

### Admin Features
- 📊 **Dashboard**: Sales statistics and inventory overview
- 📦 **Product Management**: Add, edit, delete products with full CRUD
- 📄 **CSV Import**: Bulk product and fitment data upload
- 📈 **Analytics**: Track popular products and low stock alerts
- 🔧 **Order Management**: Process and track customer orders

### Technical Features
- ⚡ **Fast Performance**: Optimized React components and API endpoints
- 🔒 **Secure**: Input validation, CORS protection, secure sessions
- 📱 **Mobile First**: Touch-friendly interface with responsive design
- 🔄 **Real-time Updates**: Live cart updates and inventory tracking
- 🧪 **Testing Ready**: Mock API for development without backend

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, customizable icons
- **Responsive Design** - Mobile-first approach

### Backend
- **Flask** - Lightweight Python web framework
- **SQLAlchemy** - Database ORM with migrations
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite/PostgreSQL** - Database (easily switchable)
- **RESTful APIs** - Clean, documented endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+ and pip
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/metier-cx-app.git
cd metier-cx-app
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev    # Starts development server at http://localhost:5173
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py        # Starts API server at http://localhost:5000
```

### 4. Database Setup
```bash
# Backend automatically creates database on first run
# To add sample data:
cd backend
source venv/bin/activate
python src/seed_data.py
```

## 📁 Project Structure

```
metier-cx-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── ShoppingCart.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── services/        # API services
│   │   │   ├── api.js       # Real API service
│   │   │   └── mockApi.js   # Mock API for testing
│   │   ├── App.jsx          # Main application component
│   │   └── App.css          # Global styles
│   ├── dist/                # Production build output
│   ├── package.json         # Dependencies and scripts
│   └── vite.config.js       # Vite configuration
├── backend/                 # Flask backend application
│   ├── src/
│   │   ├── models/          # Database models
│   │   │   ├── product.py   # Product and category models
│   │   │   ├── order.py     # Order and cart models
│   │   │   └── user.py      # User model
│   │   ├── routes/          # API endpoints
│   │   │   ├── product.py   # Product API routes
│   │   │   ├── cart.py      # Shopping cart routes
│   │   │   ├── order.py     # Order management routes
│   │   │   └── admin.py     # Admin panel routes
│   │   ├── main.py          # Flask application entry point
│   │   └── seed_data.py     # Sample data generator
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment
├── docs/                    # Documentation and templates
│   ├── metier_cx_app_requirements.pdf
│   ├── products_template.csv
│   ├── fitment_template.csv
│   └── aliases_template.csv
├── GITHUB_MIGRATION_GUIDE.md
├── DEPLOYMENT_INSTRUCTIONS.md
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:5000  # Backend API URL
```

#### Backend (.env)
```bash
DATABASE_URL=sqlite:///metier_cx.db      # Database connection
SECRET_KEY=your-secret-key-here          # Flask secret key
CORS_ORIGINS=http://localhost:5173       # Allowed origins
```

### Switching API Modes

**Development/Testing (Mock API):**
```javascript
// In frontend/src/App.jsx
import MockApiService from './services/mockApi'
const API = MockApiService
```

**Production (Real Backend):**
```javascript
// In frontend/src/App.jsx
import ApiService from './services/api'
const API = ApiService
```

## 📊 API Documentation

### Products
- `GET /api/products` - List products with search/filter
- `GET /api/products/{id}` - Get product details
- `GET /api/categories` - List product categories

### Shopping Cart
- `GET /api/cart` - Get cart contents
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/{id}` - Remove item from cart

### Orders
- `POST /api/orders/checkout` - Create new order
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders/{id}/confirm-payment` - Confirm payment

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/products` - Product management
- `POST /api/admin/upload/products` - Upload CSV data

## 🚀 Deployment

### Quick Deploy Options

1. **Vercel (Frontend) + Railway (Backend)**
   - Push to GitHub
   - Connect repositories to platforms
   - Configure environment variables
   - Deploy!

2. **Netlify (Frontend) + Render (Backend)**
   - Build frontend locally
   - Upload to Netlify
   - Connect backend to Render

See [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md) for detailed guides.

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
pnpm run dev
# Open http://localhost:5173
# Test: search, cart, checkout
```

### Backend Testing
```bash
cd backend
source venv/bin/activate
python src/main.py
# Test API at http://localhost:5000/api
```

### Test Scenarios
- Search for "MP17029" (sample part number)
- Add items to cart and modify quantities
- Complete checkout process
- Test admin panel functionality
- Test mobile responsiveness

## 📱 Mobile Support

- ✅ Responsive design for all screen sizes
- ✅ Touch-friendly interface
- ✅ Mobile-optimized checkout
- ✅ Swipe gestures for cart management
- ✅ Fast loading on mobile networks

## 🔐 Security Features

- Input validation and sanitization
- CORS protection
- Secure session management
- SQL injection prevention
- XSS protection
- Environment variable security

## 🎯 Sample Data

The application includes realistic automotive parts data:

- **Compressor Wheel (MP17029)** - Ford Powerstroke 7.3L
- **GTX 2867R Turbocharger** - Subaru WRX STI
- **500HP Intercooler Kit** - Subaru WRX
- **Electronic Boost Controller** - Universal
- **Cold Air Intake System** - Subaru WRX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 Check [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md)
- 🐛 Report issues on GitHub
- 💬 Ask ChatGPT for code assistance
- 📧 Contact support for business inquiries

## 🎉 Acknowledgments

- Built with modern web technologies
- Designed for automotive industry needs
- Optimized for performance and scalability
- Ready for production deployment

---

**Ready to revolutionize automotive parts e-commerce!** 🚗⚡

