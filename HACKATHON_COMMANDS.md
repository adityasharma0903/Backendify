# 🎯 Backendify Commands - Quick Reference for Hackathon

## Installation
```bash
# Clone/Navigate to project
cd C:\Users\adity\OneDrive\Desktop\Backendify

# All commands run from here!
```

---

## 🚀 Main Commands (Most Important)

### **1️⃣ GENERATE - Create Backend + Inject Frontend**
```bash
node cli.js generate [path] --quick

# What it does:
# ✅ Detects React useState in frontend
# ✅ Creates MongoDB models
# ✅ Creates Express routes
# ✅ Auto-injects fetch API calls into React
# ✅ Generates .env file

# Example:
node cli.js generate test-frontend-3 --quick
```

**Output:**
```
✔ Backend structure created
✔ Database configured
✔ Models generated (Product.js, User.js)
✔ Routes generated (/api/products, /api/users)
✔ Injected API calls in 1 files
✔ Smart API Generation Complete!
```

---

### **2️⃣ DEPLOY - Ship to Production**
```bash
node cli.js deploy [path] --frontend skip --backend railway

# What it does:
# ✅ Validates backend setup
# ✅ Logs into Railway (opens browser)
# ✅ Creates new Railway project
# ✅ Uploads backend code
# ✅ Starts MongoDB connection
# ✅ Returns live URL

# Example:
node cli.js deploy test-frontend-3 --frontend skip --backend railway
```

**Output:**
```
✔ Backend deployed on Railway
Deployment complete
✓ Backend deployed -> https://offbyte-202603071859-production.up.railway.app
```

---

### **3️⃣ CONNECT - Auto-Fix Frontend API URLs**
```bash
node cli.js connect [path]

# What it does:
# ✅ Finds API component
# ✅ Fixes hardcoded localhost URLs
# ✅ Updates to production URLs
# ✅ Fixes field mismatches

# Example:
node cli.js connect test-frontend-3
```

---

### **4️⃣ SYNC - Update Backend When Frontend Changes**
```bash
node cli.js sync [path]

# What it does:
# ✅ Detect new fields in React state
# ✅ Update MongoDB schema
# ✅ Update API routes
# ✅ Update frontend fetch calls

# Example: Add new field "color" to product -> run sync
node cli.js sync test-frontend-3
```

---

## 🔧 Development Workflow

### **Start Backend Server (Local)**
```bash
cd test-frontend-3/backend
npm install              # Only first time
npm run dev             # Start on localhost:5000
```

**Output:**
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected
✅ Database connected
```

---

### **Start Frontend Server (Local)**
```bash
cd test-frontend-3
npm install              # Only first time
npm run dev             # Start on localhost:3000

# Browser opens automatically
# Interact with app, data saves to local MongoDB
```

---

## 🧪 Testing APIs

### **Health Check**
```bash
# Local
curl http://localhost:5000/api/health

# Production (after deploy)
curl https://offbyte-202603071859-production.up.railway.app/api/health
```

**Response:**
```json
{"status":"ok","timestamp":"2026-03-08T10:30:00.000Z"}
```

---

### **Get All Products**
```bash
# Local
curl http://localhost:5000/api/products

# Production
curl https://offbyte-202603071859-production.up.railway.app/api/products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Laptop",
      "price": 999,
      "category": "Electronics",
      "createdAt": "2026-03-08T10:00:00.000Z"
    }
  ]
}
```

---

### **Create Product**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Phone","price":699,"category":"Electronics"}'
```

---

### **Delete Product**
```bash
curl -X DELETE http://localhost:5000/api/products/[PRODUCT_ID]
```

---

## 🌍 Deployment Commands

### **Option 1: Railway (Recommended)**
```bash
node cli.js deploy --frontend skip --backend railway

# Questions:
# ? Railway project name: offbyte-backend
# ? Railway service name: (leave blank)
```

---

### **Option 2: Render**
```bash
node cli.js deploy --frontend skip --backend render

# Questions:
# ? Render service ID: (get from https://render.com)
```

---

### **Option 3: Cloudflare Pages (Static only)**
```bash
node cli.js deploy --frontend skip --backend cloudflare

# ⚠️ Note: Only works for static sites
# Express server won't run!
```

---

## 📊 Complete Demo Flow (5-minute hackathon demo)

### **Segment 1: Show Frontend (1 min)**
```bash
cd test-frontend-3
npm run dev

# Show: React component with products list
# Click "Add Product" → data saves locally (useState)
```

---

### **Segment 2: Generate Backend (30 secs)**
```bash
# In new terminal
node cli.js generate test-frontend-3 --quick

# Watch:
# ✔ Models generated
# ✔ Routes generated
# ✔ Code injected
```

---

### **Segment 3: Show Injected Code (1 min)**
```bash
# Open editor
# Show test-frontend-3/src/App.jsx

# Point out:
# - const API_URL = 'http://localhost:5000/api'
# - useEffect(() => { fetchProducts() }, [])
# - handleAdd now does fetch POST
```

---

### **Segment 4: Restart & Test (1 min)**
```bash
# Stop frontend (Ctrl+C)
# Restart frontend: npm run dev

# Click "Add Product" again
# Check API call in DevTools Network tab
# Data saved to MongoDB! ✅
```

---

### **Segment 5: Deploy to Production (1.5 min)**
```bash
node cli.js deploy --frontend skip --backend railway

# Watch deploy happen
# Show final URL: https://offbyte-*.up.railway.app

# Test in browser:
# https://offbyte-202603071859-production.up.railway.app/api/health
# Response: {"status":"ok"} ✅
```

---

## 🎨 File Management

### **Check Generated Backend**
```bash
# Models
ls test-frontend-3/backend/models/

# Routes
ls test-frontend-3/backend/routes/

# Config
cat test-frontend-3/backend/.env
```

---

### **View Generated Frontend Changes**
```bash
cat test-frontend-3/src/App.jsx | grep -A5 "useEffect"
cat test-frontend-3/src/App.jsx | grep -A5 "API_URL"
```

---

## ⚠️ Common Issues & Fixes

### **Issue: `Cannot GET /health`**
**Reason:** Using `/health` instead of `/api/health`
```bash
# Wrong
curl http://localhost:5000/health

# Correct
curl http://localhost:5000/api/health
```

---

### **Issue: `MongoDB Connection Error`**
**Reason:** `.env` has wrong connection string
```bash
# Edit backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/offbyte
```

---

### **Issue: `Cannot find module 'express'`**
**Reason:** Dependencies not installed
```bash
cd test-frontend-3/backend
npm install
```

---

### **Issue: `Port 5000 already in use`**
**Reason:** Server already running
```bash
# Kill existing process
lsof -ti:5000 | xargs kill -9    # Mac/Linux

# Or just: restart terminal
```

---

## 📈 Architecture Summary

```
┌─────────────────────────────────────────┐
│   YOUR REACT APP                        │
│   (useState + handleAdd)                 │
└─────────────────────────────────────────┘
              ↓ (Read)
┌─────────────────────────────────────────┐
│   BACKENDIFY SCANNER                    │
│   (Detects products, users resources)   │
└─────────────────────────────────────────┘
              ↓ (Generate)
┌─────────────────────────────────────────┐
│   EXPRESS SERVER + MONGODB              │
│   (/api/products, /api/users routes)    │
└─────────────────────────────────────────┘
              ↓ (Inject)
┌─────────────────────────────────────────┐
│   UPDATED REACT APP                     │
│   (useEffect + fetch API calls)         │
└─────────────────────────────────────────┘
              ↓ (Deploy)
┌─────────────────────────────────────────┐
│   PRODUCTION ON RAILWAY                 │
│   (Live URL + MongoDB Atlas)            │
└─────────────────────────────────────────┘
```

---

## 🏆 Hackathon Talking Points

**Problem We Solve:**
> "Every full-stack developer spends 80% of time writing backend - models, routes, middleware, database setup. Backendify automates this from frontend code detection."

**Our Solution:**
> "One CLI command detects your React state, generates production-ready Express backend, injects API calls, and deploys everything."

**Key Innovation:**
> "Code generation from frontend AST - we read your React components and generate matching backend!"

**Metrics:**
- ⏱️ **80% faster** than manual backend coding
- 🚀 **1-command deploy** to production
- 📱 **Full-stack** with database, auth, validation
- 🔄 **Bidirectional sync** - update frontend? Backend updates too!

---

**Ready for demo? You've got this! 🎉**
