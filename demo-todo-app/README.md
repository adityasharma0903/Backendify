# Demo Todo App

**A clean React todo list app with NO backend - perfect for demonstrating Backendify!**

## 🎯 Purpose

This app demonstrates Backendify's core capability: transforming a local-state React app into a full-stack application with automatic backend generation and API integration.

## 📦 Current State

- ✅ React 18 + Vite
- ✅ Local state management with `useState`
- ✅ Todo CRUD operations (Create, Toggle, Delete)
- ✅ Priority levels (Low, Medium, High)
- ✅ Stats dashboard
- ❌ **NO backend**
- ❌ **NO API calls**
- ❌ **NO database** (data lost on refresh!)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit http://localhost:3000

## 🎪 Hackathon Demo Flow

### **Before Backendify:**
```bash
# Run the app
npm run dev

# Add a todo
# Refresh the page → Data is GONE! 😢
```

### **After Backendify:**
```bash
# Generate backend + inject API calls (from workspace root)
node cli.js generate demo-todo-app --quick

# Check what changed:
# 1. backend/ folder created with Express + MongoDB
# 2. src/App.jsx now has API calls
# 3. useEffect hooks added for data fetching
# 4. Data persists in database!
```

### **Deploy to Production:**
```bash
# Deploy backend to Railway
node cli.js deploy --backend railway

# Your API is now LIVE! 🎉
# Try: curl https://your-app.railway.app/api/todos
```

## 📁 File Structure

```
demo-todo-app/
├── src/
│   ├── main.jsx         # React entry point
│   ├── App.jsx          # Todo list component (local state)
│   └── App.css          # Styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## 🔍 Key Features to Highlight

1. **Priority System**: Todos have low/medium/high priority
2. **Stats Dashboard**: Total, Pending, Completed counts
3. **Clean UI**: Professional design for demo
4. **Simple State**: Easy to understand `useState` patterns
5. **Perfect Detection Target**: Backendify will find todos array!

## 🎤 Pitch Points

- "This app works, but refresh the page... data's gone!"
- "Now watch this: one command, and it gets a full backend"
- "No manual API writing, no backend setup, all automatic"
- "From local state to production in 2 minutes"

## 📊 Data Structure

Backendify will detect this shape from `useState`:

```javascript
{
  id: 1,
  title: "Learn React",
  completed: false,
  priority: "high"
}
```

And generate:
- MongoDB schema with validation
- REST API endpoints (GET, POST, PUT, DELETE)
- Automatic API injection into React components
