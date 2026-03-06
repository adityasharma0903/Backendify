# 🎯 Backendify Configuration Examples

## Scenario 1: Quick API (Express + MongoDB + JWT)

### Configuration
```
Database: MongoDB (Mongoose)
Framework: Express.js
Sockets: No
Auth: Yes (JWT)
Validation: Yes
Caching: No
Logging: Yes
```

### Generated Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "joi": "^17.10.0",
  "winston": "^3.10.0",
  "morgan": "^1.10.0"
}
```

### Use Case
✅ REST API development
✅ Microservices
✅ MVP applications
✅ Rapid prototyping

### Server Size
Small to Medium (~50-200 concurrent users)

---

## Scenario 2: Real-time Chat App (Express + MongoDB + Socket.io)

### Configuration
```
Database: MongoDB (Mongoose)
Framework: Express.js
Sockets: Yes
Auth: Yes (JWT)
Validation: Yes
Caching: Yes (Redis)
Logging: Yes
```

### Generated Dependencies
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
  "morgan": "^1.10.0"
}
```

### Project Structure
```
backend/
├── socket/
│   └── handlers.js        # Message, typing events
├── auth/
│   └── jwtAuth.js        # User authentication
├── models/
│   ├── User.js
│   ├── Conversation.js
│   └── Message.js
```

### Key Features
- Real-time messaging
- User authentication
- Redis caching for messages
- Persistent storage in MongoDB

### Use Case
✅ Chat applications
✅ Collaborative tools
✅ Live notifications
✅ Gaming backends

---

## Scenario 3: Enterprise App (NestJS + PostgreSQL + OAuth)

### Configuration
```
Database: PostgreSQL (Sequelize)
Framework: NestJS
Sockets: Yes
Auth: Yes (OAuth)
Validation: Yes
Caching: Yes (Redis)
Logging: Yes
```

### Generated Dependencies
```json
{
  "@nestjs/common": "^10.2.8",
  "@nestjs/core": "^10.2.8",
  "@nestjs/platform-express": "^10.2.8",
  "sequelize": "^6.33.0",
  "pg": "^8.11.1",
  "pg-hstore": "^2.3.4",
  "passport": "^0.6.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-facebook": "^3.0.0",
  "redis": "^4.6.10",
  "ioredis": "^5.3.2",
  "winston": "^3.10.0"
}
```

### Project Structure
```
backend/
├── config/
│   ├── database.js        # PostgreSQL connection
│   └── oauth.js          # OAuth strategy config
├── modules/
│   ├── users/
│   ├── auth/
│   └── notifications/
├── socket/
│   └── handlers.js       # Real-time updates
├── guards/
│   └── oauth.guard.ts
```

### Key Features
- Full-featured framework
- Enterprise authentication
- Relational database
- Streaming support
- Type-safe with TypeScript

### Use Case
✅ Enterprise applications
✅ Complex business logic
✅ Large teams
✅ Multi-tenant SaaS

---

## Scenario 4: High-Performance API (Fastify + MySQL)

### Configuration
```
Database: MySQL (Sequelize)
Framework: Fastify
Sockets: No
Auth: Yes (JWT)
Validation: Yes
Caching: Yes (Redis)
Logging: Yes
```

### Generated Dependencies
```json
{
  "fastify": "^4.21.0",
  "@fastify/cors": "^8.4.2",
  "@fastify/helmet": "^11.1.1",
  "sequelize": "^6.33.0",
  "mysql2": "^3.6.0",
  "redis": "^4.6.10",
  "jsonwebtoken": "^9.0.2",
  "joi": "^17.10.0",
  "winston": "^3.10.0"
}
```

### Performance Metrics
- ⚡ ~100ms response time
- 🚀 10,000+ requests/second
- 💾 Low memory footprint
- 📦 Automatic compression

### Key Features
- Fastest Node.js framework
- MySQL for data persistence
- Redis for caching
- JWT authentication
- Comprehensive logging

### Use Case
✅ High-traffic APIs
✅ E-commerce platforms
✅ Real-time data processing
✅ Video streaming backends

---

## Scenario 5: Lightweight Project (Express + SQLite)

### Configuration
```
Database: SQLite
Framework: Express.js
Sockets: No
Auth: No
Validation: Yes
Caching: No
Logging: No
```

### Generated Dependencies
```json
{
  "express": "^4.18.2",
  "sequelize": "^6.33.0",
  "sqlite3": "^5.1.6",
  "joi": "^17.10.0"
}
```

### Database File
- Single file: `database.sqlite`
- No server needed
- Good for prototyping

### Project Structure
```
backend/
├── config/
│   └── database.js      # SQLite setup
├── models/
│   └── User.js
├── routes/
│   └── index.js
└── server.js
```

### Key Features
- Zero database setup
- Perfect for learning
- Easy deployment
- Portable database

### Use Case
✅ Learning/tutorials
✅ Desktop apps
✅ Local tools
✅ Quick POCs

---

## Scenario 6: Session-Based Web App (Express + PostgreSQL + Session)

### Configuration
```
Database: PostgreSQL
Framework: Express.js
Sockets: No
Auth: Yes (Session-Based)
Validation: Yes
Caching: Yes (Redis)
Logging: Yes
```

### Generated Dependencies
```json
{
  "express": "^4.18.2",
  "express-session": "^1.17.3",
  "sequelize": "^6.33.0",
  "pg": "^8.11.1",
  "pg-hstore": "^2.3.4",
  "redis": "^4.6.10",
  "joi": "^17.10.0",
  "winston": "^3.10.0",
  "passport": "^0.6.0"
}
```

### Session Flow
1. User logs in → Session created
2. Session ID stored in Redis
3. Cookie sent to client
4. Client sends session cookie on each request
5. Server validates session from Redis

### Use Case
✅ Traditional web applications
✅ Server-rendered applications
✅ Admin dashboards
✅ Legacy system modernization

---

## Quick Comparison Table

| Config | Database | Framework | Sockets | Auth | Best For |
|--------|----------|-----------|---------|------|----------|
| 1 | MongoDB | Express | ❌ | JWT | Quick APIs |
| 2 | MongoDB | Express | ✅ | JWT | Chat apps |
| 3 | PostgreSQL | NestJS | ✅ | OAuth | Enterprise |
| 4 | MySQL | Fastify | ❌ | JWT | High-traffic |
| 5 | SQLite | Express | ❌ | ❌ | Learning |
| 6 | PostgreSQL | Express | ❌ | Session | Traditional web |

---

## Generation Command Examples

### Scenario 1
```bash
backendify generate --quick  # Uses all defaults
```

### Scenario 2
Interactive:
```bash
backendify generate
# Select: MongoDB, Express, Yes (sockets), Yes (auth), JWT, Yes, Yes, Yes
```

### Scenario 3
Interactive:
```bash
backendify generate
# Select: PostgreSQL, NestJS, Yes, Yes, OAuth, Yes, Yes, Yes
```

### Scenario 4
Interactive:
```bash
backendify generate
# Select: MySQL, Fastify, No, Yes, JWT, Yes, Yes, Yes
```

### Scenario 5
Interactive:
```bash
backendify generate
# Select: SQLite, Express, No, No, N/A, Yes, No, No
```

### Scenario 6
Interactive:
```bash
backendify generate
# Select: PostgreSQL, Express, No, Yes, Session, Yes, Yes, Yes
```

---

## Next Steps After Generation

### Install & Run
```bash
cd backend
npm install
npm run dev
```

### Create First API Endpoint
See your generated `controllers/userController.js` and `routes/` folder.

### Connect Frontend
```bash
cd ..
backendify connect  # Auto-connects your frontend
```

### Deploy
Each generated backend is production-ready:
- ✅ Error handling
- ✅ Logging
- ✅ Security headers (helmet)
- ✅ CORS configured
- ✅ Rate limiting
- ✅ Input validation

---

**Start with `backendify generate` and choose your configuration! ⚡**
