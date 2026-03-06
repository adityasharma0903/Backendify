# Backendify v2.0 🚀 Enterprise-Grade Backend Generator

**Generate production-ready backends for large-scale applications** - Ecommerce, SaaS, Multi-tenant apps, and more!

> **NEW IN v2.0**: Full production features - Pagination, Filtering, Sorting, Search, Bulk Operations, Advanced Security, Performance Optimization, and much more!

## What is Backendify?

Backendify scans your frontend code, detects API calls, and automatically generates a **enterprise-grade Express.js + MongoDB backend** with:

✅ **Advanced CRUD Operations** - Pagination, filtering, sorting, search  
✅ **MongoDB + Mongoose Models** - With validation, hooks, and methods  
✅ **Security Stack** - Rate limiting, input validation, Helmet.js, JWT auth  
✅ **Performance** - Compression, caching, database indexes, bulk operations  
✅ **Professional Middleware** - Error handling, logging, CORS, sanitization  
✅ **Complete REST APIs** - All endpoints auto-connected to frontend  
✅ **Production Ready** - Environment config, graceful shutdown, monitoring ready  
✅ **100% Offline** - No AI dependency, works without internet  
✅ **🆕 Socket.io Chat** - Real-time messaging, presence, typing indicators  

## 🆕 Socket.io Real-Time Chat Support

**Backendify now automatically detects chat/messaging in your frontend and generates a complete real-time backend!**

No matter how big your app is - if it has chat, Backendify generates the backend for it:

- ✅ Complete Socket.io server with JWT authentication
- ✅ Real-time messaging with delivery & read receipts
- ✅ Chat models (Message, Conversation) with MongoDB persistence
- ✅ REST API endpoints for chat history & management
- ✅ Typing indicators & online presence tracking
- ✅ Group chats, channels, and direct messaging
- ✅ Message reactions, editing, and deletion
- ✅ File sharing support

### How It Works:

```javascript
// Your frontend has Socket.io?
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

socket.emit('message', { text: 'Hello!' });
socket.on('message', (data) => console.log(data));
```

Just run `backendify generate` and get:
- ✅ `backend/socket/index.js` - Complete Socket.io server
- ✅ `backend/models/Message.js` - Message model with reactions
- ✅ `backend/models/Conversation.js` - Conversation/room management
- ✅ `backend/routes/chat.routes.js` - REST API for chat
- ✅ Integrated Socket.io with your Express server

**👉 See [SOCKET_FEATURE_GUIDE.md](./SOCKET_FEATURE_GUIDE.md) for complete documentation!**  

## 🎯 Perfect For

- 🛍️ **Ecommerce Apps** - Products, orders, cart, payments
- 💼 **SaaS Platforms** - Users, subscriptions, analytics
- 📱 **Mobile Apps** - Full backend with authentication
- 🏢 **Enterprise Software** - High-performance, scalable
- 🎮 **Gaming Backends** - Player data, leaderboards, economy
- 📊 **Dashboards & Analytics** - Data-heavy applications

## Installation

```bash
npm install -g backendify
```

## Quick Start (2 Commands!)

```bash
# 1️⃣ Generate production backend (auto-connect is default)
backendify generate

# 2️⃣ Start backend
cd backend && npm run dev

# ✅ Your backend is running on http://localhost:5000
```

### Complete Workflow:

```bash
# Initial generation
backendify generate

# Start backend
cd backend && npm run dev

# Later: Sync backend when frontend changes
backendify sync

# Test performance & scalability
backendify benchmark
```

**See [QUICK_START_v2.md](./QUICK_START_v2.md) for full guide!**

## 🎯 Smart API Generation (NEW!)

**Generate full-stack APIs from your frontend code patterns - No API calls needed!**

Perfect for when you're building the frontend first and haven't added API calls yet!

```bash
backendify generate-api
```

### How It Works:

**Before:** Your frontend has data structures but no API integration:
```jsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // TODO: Add API calls later
  
  return (
    <div>
      {products.map(product => (
        <div>{product.name}</div>
      ))}
    </div>
  );
}
```

**After running `backendify generate-api`:**

1. ✅ **Detects Resources** - Scans for state variables (`products`, `orders`, `users`)
2. ✅ **Generates Backend** - Creates models, routes, controllers  
3. ✅ **Generates API Clients** - Creates `src/api/product.js`, etc.
4. ✅ **Injects API Calls** - Adds fetch logic to your components

**Result - Your code is auto-updated:**
```jsx
import { getAllProducts } from '../api/product.js';

function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data.data || data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);
  
  return <div>{products.map(product => <div>{product.name}</div>)}</div>;
}
```

### Detection Patterns:

Backendify automatically detects resources from:
- ✅ `const [products, setProducts] = useState([])`
- ✅ `products.map(product => ...)`
- ✅ `<input name="productName" />`
- ✅ `useEffect(() => { /* fetch products */ })`

### What Gets Generated:

**Backend** (full CRUD):
- ✅ `backend/models/Product.js`
- ✅ `backend/routes/products.routes.js`
- ✅ `backend/server.js` (auto-updated)
- ✅ `backend/.env` (auto-generated from template)
- ✅ `backend/middleware/validation.js` (auto-generated)
- ✅ `backend/utils/pagination.js` and `backend/utils/helper.js` (auto-generated)

**Frontend** (API clients):
- ✅ `src/api/product.js` (getAllProducts, getProductById, createProduct, etc.)
- ✅ `src/api/index.js`

### Skip Code Injection:

```bash
# Generate APIs without modifying frontend files
backendify generate-api --no-inject
```

Then manually use the generated API clients in your code.

## 🔄 Sync Backend with Frontend Changes

After initial backend generation, keep it in sync with frontend updates:

```bash
# Scan frontend for new APIs and update backend
backendify sync

# ✅ Adds new models/routes for new resources
# ✅ Adds missing fields to existing models
# ✅ Preserves custom backend logic
# ✅ No overwriting of your code!
```

**Use Case:** Added new API calls in frontend? Just run `backendify sync` to update backend automatically!

## ⚡ Performance Testing & Scalability

Test your backend under load and get optimization recommendations:

```bash
# Run scalability tests
backendify benchmark

# Custom load levels
backendify benchmark --levels 10,100,1000,10000

# Startup growth simulation
backendify benchmark --startup-mode
```

### What You Get:

📊 **Scalability Score** (0-100)  
📈 **Performance at Different Load Levels** (10, 100, 1k, 10k concurrent users)  
🔴 **Bottleneck Detection** (slow APIs, database issues)  
💡 **Smart Recommendations** (caching, indexing, optimization tips)  
🚀 **Startup Growth Simulation** (predict when your system will struggle)

### Sample Report:

```
📊 Scalability Score: 78/100 (Good)

📈 Performance Summary:
✅ 10 users    → 45ms avg latency
✅ 100 users   → 120ms avg latency
⚠️  1000 users  → 380ms avg latency
❌ 10000 users → 1200ms avg latency

🔴 Detected Bottlenecks:
❌ /api/orders is slow (1250ms) at 10k users
⚠️  Database queries without indexes

💡 Recommended Optimizations:
[HIGH] Add database indexes on frequently queried fields
[HIGH] Implement caching (Redis/Memcached) for reads
[MEDIUM] Enable GZIP compression
[MEDIUM] Use pagination for list endpoints

🚀 Startup Growth Simulation:
Month 1  →   100 users   ✅ Stable
Month 6  →  10k users    ✅ Stable
Month 12 → 100k users    ⚠️  Optimization needed
```

**See [QUICK_START_v2.md](./QUICK_START_v2.md) for full guide!**

## P0/P1 Stable Workflow (Recommended)

```bash
# P0: Run regression checks for scanner/connect/update flow
npm run test:p0

# P1: Generate and connect in one stable flow
backendify generate
backendify connect .

# Run backend
cd backend
npm run dev
```

Frontend tip:
- Keep frontend base URL as `http://localhost:5000` (without `/api`)
- Call endpoints as `/api/...` from the app

## v2.0 Features

### 🔍 Advanced Query Features
- ✅ **Pagination** - `?page=1&limit=20`
- ✅ **Search** - `?search=laptop` across multiple fields
- ✅ **Filtering** - `?status=active&price=100..500`
- ✅ **Sorting** - `?sort=-price,name`
- ✅ **Bulk Operations** - Create/update/delete multiple records

### 🛡️ Security & Reliability
- ✅ **Rate Limiting** - Prevent API abuse
- ✅ **Input Validation** - Express-validator integration
- ✅ **Data Sanitization** - MongoDB injection prevention
- ✅ **Security Headers** - Helmet.js
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **CORS Protection** - Configurable allowed origins

### ⚡ Performance Optimization
- ✅ **Response Compression** - Gzip compression
- ✅ **Database Indexes** - Optimized queries
- ✅ **HTTP Caching** - Cache-Control headers
- ✅ **Connection Pooling** - Efficient DB connections
- ✅ **Request Logging** - Monitor all traffic

### 📊 Advanced Database Layer
- ✅ **Mongoose Hooks** - Pre/post save, update, delete
- ✅ **Soft Delete** - Data recovery without hard delete
- ✅ **Versioning** - Track record changes
- ✅ **Virtual Fields** - Computed properties
- ✅ **Query Helpers** - Reusable custom queries
- ✅ **Static Methods** - Bulk operations, aggregations

## Features

### 🔧 Offline Mode (Default)
- AI-Powered backend generation
- More intelligent route mapping
- Advanced schema inference
- Requires API key (OpenAI/Gemini)

## Generated Backend Structure

```
backend/
├── server.js                 # Express server entry point
├── package.json              # Dependencies
├── .env                       # Environment config
├── routes/                    # API endpoints
│   ├── users.routes.js
│   └── products.routes.js
├── models/                    # Mongoose schemas
│   ├── User.model.js
│   └── Product.model.js
├── middleware/                # Express middleware
│   ├── errorHandler.js       # Error handling
│   └── requestLogger.js       # Request logging
└── config/                    # Configuration files
```

## Commands

```bash
# Generate backend (auto-connect by default)
backendify generate [path]

# Generate without auto-connect
backendify generate --no-auto-connect [path]

# Smart API generation - Detect resources from frontend & auto-generate APIs
backendify generate-api [path]
backendify generate-api --no-inject  # Skip frontend code injection

# Run connect pass explicitly
backendify connect [path]

# Sync backend with frontend changes (update without overwriting custom code)
backendify sync [path]

# Run scalability & performance tests
backendify benchmark [path]
backendify benchmark --levels 10,100,1000 --duration 10
backendify benchmark --startup-mode

# System health check
backendify doctor

# P0 regression tests
npm run test:p0
```

## How It Works

### Step 1: Frontend Scanning
Backendify scans your project for API calls:
```javascript
// Your frontend code
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John', email: 'john@example.com' })
})
```

### Step 2: Route Mapping
Detected endpoint:
```
POST /api/users → Create route + User model
```

### Step 3: Template Injection
Production templates are injected with your detected schema:
```javascript
// Auto-generated model
const UserSchema = {
  name: String,
  email: String,
  // ... more fields
}
```

### Step 4: Installation
All dependencies are auto-installed:
- express
- mongoose
- cors
- dotenv
- And more!

## Production Features

- **Error Handling**: Comprehensive error middleware
- **Request Logging**: Built-in request/response logging
- **Timestamps**: Created/Updated timestamps on all models
- **CORS**: Enabled by default (configurable)
- **Environment Variables**: Secure config management
- **Health Check**: `/health` endpoint included
- **Graceful Shutdown**: Proper database disconnection

## Requirements

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)

## Environment Setup

After generation, update `.env`:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/myapp

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Running the Backend

```bash
cd backend

# Development (with auto-reload)
npm run dev

# Production
npm start
```

Visit: `http://localhost:5000/health`

## Customization

### Add More Routes
Create files in `backend/routes/`:
```javascript
// backend/routes/custom.routes.js
import express from 'express';
const router = express.Router();

router.get('/custom', (req, res) => {
  res.json({ message: 'Custom route' });
});

export default router;
```

Then register in `server.js`:
```javascript
import customRoutes from './routes/custom.routes.js';
app.use('/api', customRoutes);
```

### Custom Models
Extend generated models in `backend/models/`:
```javascript
schema.pre('save', async function() {
  // Custom logic before save
});
```

## System Health Check

```bash
backendify doctor
```

Checks:
- ✅ Node.js installed
- ✅ npm ready
- ✅ MongoDB running
- ✅ Port 5000 available

## Use Cases

- **Rapid Prototyping**: Generate full backend in seconds
- **Hackathons**: Winning demo-ready code
- **Learning**: Understand backend structure
- **Microservices**: Starter template for services
- **API-First Development**: Backend from frontend API needs

## Hackathon Strategy

```bash
# Show frontend (already built)
# Run Backendify
npx backendify generate

# Choose Offline
# ✨ Backend ready in 5 seconds

# Delete backend
# Run Backendify again

# Choose Online (AI mode)
# ✨ More advanced backend generated

# Judges: 😲
```

## Roadmap

- [x] Offline Mode (Rule-Based)
- [x] Auto-route generation
- [x] Auto-model generation
- [x] Smart API Generation (`generate-api`) for frontend-first apps
- [x] Auto-create backend scaffold in `generate-api` (`.env`, middleware, utils)
- [x] Avoid false resource detection (e.g. `filteredTodos`, `sortedData`)
- [x] Testing setup (P0 Regression Suite)
- [x] Frontend-Backend Auto-Connection (Connect Mode)
- [x] Advanced URL/Response Parsing Fixes
- [ ] Online Mode (AI-Powered)
- [ ] TypeScript support
- [ ] Database options (PostgreSQL, MySQL)
- [ ] GraphQL support
- [ ] Docker support
- [ ] CI/CD pipeline generation

## Troubleshooting

### MongoDB Connection Failed
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas
# Update MONGODB_URI in .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Port 5000 Already in Use
```bash
# Change port in .env
PORT=5001
```

### Dependencies Installation Failed
```bash
cd backend
npm install --legacy-peer-deps
```

## Contributing

Suggestions and contributions are welcome!

---

**Made with ❤️ for developers who want to focus on building, not boilerplate.**
