# Backendify 🚀

**Hybrid Backend Generator** - Generate production-ready backends in seconds with offline rule-based or AI-powered modes.

## What is Backendify?

Backendify scans your frontend code, detects API calls, and automatically generates a **production-level Express.js + MongoDB backend** with:

✅ Auto-generated REST API routes  
✅ MongoDB + Mongoose models  
✅ Error handling middleware  
✅ Request logging  
✅ CORS enabled  
✅ Environment setup  
✅ Proper folder structure  

## Installation

```bash
npm install -g backendify
```

## Quick Start

```bash
# Navigate to your project
cd my-project

# Generate backend
backendify generate

# Choose mode when prompted:
# 1️⃣ Offline (Rule-Based) - Fast & stable
# 2️⃣ Online (AI-Powered) - Coming soon

# Your backend is ready!
cd backend
npm run dev
```

## Features

### 🔧 Offline Mode (Default)
- **Rule-Based Engine** that analyzes your frontend
- Detects `fetch()` and `axios` API calls
- Maps HTTP methods to CRUD operations
- Generates models based on request bodies
- **No internet required** - Fast & reliable

### 🤖 Online Mode (Coming)
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
# Generate backend
backendify generate [path]

# System health check
backendify doctor
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
- [ ] Online Mode (AI-Powered)
- [ ] TypeScript support
- [ ] Database options (PostgreSQL, MySQL)
- [ ] GraphQL support
- [ ] Testing setup (Jest/Mocha)
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

## License

MIT

---

**Made with ❤️ for developers who want to focus on building, not boilerplate.**
