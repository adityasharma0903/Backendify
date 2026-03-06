# 🚀 Backendify Interactive Setup Guide

## Quick Start

### Interactive Mode (Recommended)
```bash
backendify generate
```

This will launch an interactive setup questionnaire with arrow key navigation.

### Quick Mode (Default Configuration)
```bash
backendify generate --quick --no-auto-connect
```

This generates a backend with pre-configured defaults:
- Database: MongoDB
- Framework: Express.js
- Sockets: Enabled
- Auth: JWT
- Validation: Enabled
- Logging: Enabled

---

## 📋 Interactive Questionnaire

When you run `backendify generate`, you'll be asked:

### 1️⃣ Select Database
```
? 📦 Select Database:
❯ MongoDB (Mongoose)
  PostgreSQL (Sequelize)
  MySQL (Sequelize)
  SQLite (Sequelize)
```

**Choose based on your needs:**
- **MongoDB**: Document-based, flexible schema, great for rapid development
- **PostgreSQL**: Relational, powerful queries, best for complex data
- **MySQL**: Relational, widely hosted, good for traditional apps
- **SQLite**: Lightweight, file-based, perfect for prototypes/testing

### 2️⃣ Select Backend Framework
```
? ⚙️  Select Backend Framework:
❯ Express.js (Recommended)
  Fastify (High Performance)
  NestJS (Enterprise)
```

**Choose based on preference:**
- **Express.js**: Simple, lightweight, huge ecosystem
- **Fastify**: Fastest performance, great for APIs
- **NestJS**: Full-featured framework, best for large projects

### 3️⃣ Enable Realtime Sockets
```
? 🔌 Enable Realtime Sockets? (Y/n)
```

Enable if you need:
- Live notifications
- Real-time chat
- Live data updates
- Collaborative features

### 4️⃣ Generate Authentication System
```
? 🔐 Generate Authentication System? (Y/n)
```

### 5️⃣ Select Authentication Type (if enabled)
```
? 🔑 Select Authentication Type:
❯ JWT (JSON Web Token)
  OAuth 2.0
  Session-Based
```

**Choose based on use case:**
- **JWT**: Stateless, API best, modern approach
- **OAuth**: Third-party integrations (Google, Facebook)
- **Session**: Traditional web apps, server-side storage

### 6️⃣ Enable Request Validation
```
? ✅ Enable Request Validation (Joi)? (Y/n)
```

Validates incoming requests against defined schemas.

### 7️⃣ Enable Redis Caching
```
? ⚡ Enable Redis Caching? (Y/n)
```

Improves performance by caching frequent queries.

### 8️⃣ Enable Advanced Logging
```
? 📊 Enable Advanced Logging? (Y/n)
```

Logs all requests and errors using Winston.

---

## 📝 Configuration Summary

After answering all questions, you'll see a summary:

```
✨ Configuration Summary:

  ✔ Database        → MongoDB (Mongoose)
  ✔ Framework       → Express.js
  ✔ Realtime Socket → Enabled
  ✔ Authentication  → Enabled (JWT)
  ✔ Validation      → Enabled
  ✔ Caching         → Disabled
  ✔ Logging         → Enabled
```

---

## 🎯 Generated Project Structure

```
your-project/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling
│   │   ├── logger.js            # Request logging
│   │   ├── validation.js        # Request validation
│   │   └── rateLimiter.js       # Rate limiting
│   ├── models/
│   │   └── User.js              # Sample User model
│   ├── controllers/
│   │   └── userController.js    # Sample controller
│   ├── routes/
│   │   └── index.js             # Sample routes
│   ├── services/                # Business logic layer
│   ├── auth/
│   │   └── jwtAuth.js           # JWT implementation
│   ├── socket/
│   │   └── handlers.js          # Socket event handlers
│   ├── events/
│   │   └── emitter.js           # Event emitters
│   ├── validators/              # Validation schemas
│   ├── utils/                   # Utility functions
│   ├── server.js                # Main server file
│   ├── package.json             # Dependencies
│   ├── README.md                # Documentation
│   └── .gitignore
├── .env                         # Environment variables
└── README.md
```

---

## 🚀 Getting Started After Generation

### 1. Navigate to backend
```bash
cd your-project/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Edit `../.env` and update:
```bash
# Database connection
MONGODB_URI=mongodb://localhost:27017/backendify

# JWT Secret (change in production!)
JWT_SECRET=your-very-secure-secret-key

# Other configurations
PORT=5000
NODE_ENV=development
```

### 4. Start development server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 5. Test health endpoint
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-06T16:14:00.000Z"
}
```

---

## 📊 Dependency Installation by Configuration

### Minimal Setup (Express + MongoDB)
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5"
}
```

### Full-Featured Setup
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "socket.io": "^4.6.1",
  "redis": "^4.6.10",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "joi": "^17.10.0",
  "winston": "^3.10.0",
  "morgan": "^1.10.0",
  "helmet": "^7.0.0",
  "cors": "^2.8.5"
}
```

---

## 🔌 Socket.io Integration

If sockets are enabled, your server includes:

### Server Setup
```javascript
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

### Using in Frontend
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.emit('send-message', { text: 'Hello!' });
socket.on('receive-message', (data) => {
  console.log('Message:', data);
});
```

---

## 🔐 Authentication Setup

### JWT Authentication

#### Generate Token
```javascript
import { generateToken } from './auth/jwtAuth.js';

const token = generateToken(userId);
```

#### Verify Token (Middleware)
```javascript
import { authMiddleware } from './auth/jwtAuth.js';

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ userId: req.userId });
});
```

#### Hash Password
```javascript
import { hashPassword, comparePassword } from './auth/jwtAuth.js';

const hashed = await hashPassword('password123');
const matches = await comparePassword('password123', hashed); // true
```

---

## ✅ Request Validation

Using Joi schema:

```javascript
import Joi from 'joi';
import { validateRequest } from './middleware/validation.js';

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

app.post('/api/users', validateRequest(createUserSchema), (req, res) => {
  const { name, email, password } = req.validatedBody;
  // ... create user
});
```

---

## 📚 Database Models

### MongoDB (Mongoose)
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
```

### PostgreSQL/MySQL (Sequelize)
```javascript
import { sequelize, DataTypes } from '../config/database.js';

export const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
}, {
  timestamps: true
});
```

---

## 🧪 Sample Workflow

### Step 1: Define a User Controller
```javascript
// controllers/userController.js
import { User } from '../models/User.js';

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.validatedBody);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Step 2: Create Routes
```javascript
// routes/users.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import Joi from 'joi';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

router.post('/', validateRequest(createUserSchema), userController.createUser);
router.get('/', userController.getUsers);

export default router;
```

### Step 3: Connect Routes
```javascript
// server.js
import userRoutes from './routes/users.js';

app.use('/api/users', userRoutes);
```

---

## 🛠️ Advanced Features

### Rate Limiting
```javascript
import { rateLimiter } from './middleware/rateLimiter.js';

app.use(rateLimiter(100)); // Max 100 requests per 15 minutes
```

### Error Handling
```javascript
import { errorHandler } from './middleware/errorHandler.js';

app.use(errorHandler);
```

### Logging
```javascript
import { requestLogger } from './middleware/logger.js';

app.use(requestLogger);
```

---

## 📧 Environment Variables Template

```env
# Backendify Configuration
NODE_ENV=development
PORT=5000
DEBUG=true

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/backendify

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Redis (if caching enabled)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## ⚠️ Production Checklist

Before deploying:

- [ ] Change `NODE_ENV` to `production`
- [ ] Set strong `JWT_SECRET`
- [ ] Update database connection string
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Setup error logging service
- [ ] Run security audit: `npm audit`
- [ ] Enable helmet for security headers
- [ ] Setup database backups
- [ ] Configure monitoring

---

## 🎓 Example Commands

```bash
# Generate with defaults
backendify generate --quick --no-auto-connect

# Generate with interactive setup
backendify generate

# Generate to specific path
backendify generate /path/to/project

# Auto-connect frontend and backend
backendify generate --auto-connect

# Sync backend with frontend changes
backendify sync

# Run diagnostics
backendify doctor
```

---

## 📞 Support

For issues or questions:
1. Check the generated README.md in your backend folder
2. Review the sample code in `controllers/` and `routes/`
3. Check environment variables in `.env`
4. Review middleware configuration in `middleware/`

---

**Made with ⚡ by Backendify**
