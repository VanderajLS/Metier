# Deployment Instructions - Metier CX App

## 🚀 Quick Deployment Guide

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Frontend Deployment (Vercel)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and select your repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL`: Your backend URL (from Railway)
6. Deploy!

#### Backend Deployment (Railway)
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure settings:
   - **Root Directory**: `backend`
   - **Start Command**: `python src/main.py`
5. Add environment variables:
   - `DATABASE_URL`: Railway will provide PostgreSQL URL
   - `SECRET_KEY`: Generate a secure key
   - `PORT`: Railway will set automatically
6. Deploy!

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)
1. Build your frontend locally:
   ```bash
   cd frontend
   pnpm run build
   ```
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `frontend/dist` folder
4. Configure environment variables in site settings

#### Backend Deployment (Render)
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python src/main.py`
5. Add environment variables

### Option 3: All-in-One Platforms

#### Heroku (Full Stack)
```bash
# Frontend build
cd frontend && pnpm run build

# Backend deployment
cd ../backend
echo "web: python src/main.py" > Procfile
git add . && git commit -m "Deploy to Heroku"
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
```

## 🗄️ Database Migration (SQLite → PostgreSQL)

### 1. Update Backend Dependencies
```bash
# Add to requirements.txt
psycopg2-binary==2.9.7
```

### 2. Update Database Configuration
```python
# In backend/src/main.py
import os
from urllib.parse import urlparse

# Database configuration
if os.environ.get('DATABASE_URL'):
    # Production (PostgreSQL)
    url = urlparse(os.environ['DATABASE_URL'])
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{url.username}:{url.password}@{url.hostname}:{url.port}{url.path}"
else:
    # Development (SQLite)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///metier_cx.db'
```

### 3. Run Database Migration
```bash
# On your deployment platform
python -c "from src.main import db; db.create_all()"
python src/seed_data.py  # Optional: Add sample data
```

## 🔧 Environment Variables Setup

### Frontend Environment Variables
```bash
# .env (for local development)
VITE_API_BASE_URL=http://localhost:5000

# Production (set in deployment platform)
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend Environment Variables
```bash
# .env (for local development)
DATABASE_URL=sqlite:///metier_cx.db
SECRET_KEY=dev-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173

# Production (set in deployment platform)
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-super-secure-secret-key
CORS_ORIGINS=https://your-frontend-url.com
PORT=5000
```

## 🔄 Switching API Modes

### For Testing/Demo (Mock API)
```javascript
// In frontend/src/App.jsx
import MockApiService from './services/mockApi'
const API = MockApiService
```

### For Production (Real Backend)
```javascript
// In frontend/src/App.jsx
import ApiService from './services/api'
const API = ApiService
```

## 📊 Health Check Endpoints

Add these to your backend for monitoring:

```python
# In backend/src/main.py
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}

@app.route('/api/status')
def api_status():
    return {
        'api': 'Metier CX API',
        'version': '1.0.0',
        'status': 'running'
    }
```

## 🚨 Common Deployment Issues & Solutions

### Issue: CORS Errors
**Solution**: Ensure backend allows frontend origin
```python
from flask_cors import CORS
CORS(app, origins=os.environ.get('CORS_ORIGINS', '*').split(','))
```

### Issue: Database Connection Errors
**Solution**: Check DATABASE_URL format
```python
# PostgreSQL URL format
postgresql://username:password@hostname:port/database_name
```

### Issue: Build Failures
**Solution**: Check Node.js and Python versions
```json
// In package.json
"engines": {
  "node": ">=18.0.0",
  "pnpm": ">=8.0.0"
}
```

### Issue: Static Files Not Loading
**Solution**: Configure build output correctly
```javascript
// In vite.config.js
export default defineConfig({
  base: './',  // For relative paths
  build: {
    outDir: 'dist'
  }
})
```

## 📈 Performance Optimization

### Frontend Optimization
```bash
# Build with optimization
pnpm run build

# Analyze bundle size
pnpm run build -- --analyze
```

### Backend Optimization
```python
# Add caching headers
@app.after_request
def after_request(response):
    response.headers['Cache-Control'] = 'public, max-age=300'
    return response
```

## 🔐 Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use HTTPS in production
- [ ] Validate all user inputs
- [ ] Set proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable database connection pooling
- [ ] Add rate limiting to APIs

## 📱 Mobile Testing

Test your deployed app on:
- iOS Safari
- Android Chrome
- Various screen sizes
- Touch interactions
- Network conditions

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database connection works
- [ ] Search functionality works
- [ ] Cart operations work
- [ ] Checkout process completes
- [ ] Admin panel accessible
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Error handling works

## 📞 Getting Help

If you encounter issues:
1. Check deployment platform logs
2. Test API endpoints directly
3. Verify environment variables
4. Check database connectivity
5. Ask ChatGPT for specific error solutions

---

**Your app is ready for production deployment!** 🚀

