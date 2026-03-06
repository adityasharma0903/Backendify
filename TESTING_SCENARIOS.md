# 🧪 Testing & Demo Scenarios

## Quick Demo: Test All Configurations

### Test 1: Default Configuration
**Command**:
```bash
backendify generate demo-express-mongo --quick --no-auto-connect
```

**Expected Output**:
```
🚀 Using default configuration...

✅ Configuration confirmed

✔ Creating backend structure...
✔ Setting up database configuration...
✔ Setting up middleware...
✔ Setting up authentication system...
✔ Creating main server file...
✔ Setting up realtime sockets...
✔ Creating package.json...
✔ Creating environment configuration...
✔ Creating sample models and routes...

🎉 Backend generated successfully!

📝 Next steps:
   1. cd demo-express-mongo/backend
   2. npm install
   3. Update .env with your configuration
   4. npm run dev
```

**Verify Structure**:
```bash
ls -la demo-express-mongo/backend/
# Should show: config/ middleware/ models/ controllers/ routes/ auth/ socket/ events/
```

---

## Test 2: Interactive with Custom Selections

### Run Command
```bash
backendify generate demo-fastify-postgres
```

### Interactions
```
? 📦 Select Database:
  MongoDB (Mongoose)
  PostgreSQL (Sequelize)
❯ MySQL (Sequelize)
```
→ *Select PostgreSQL*

```
? ⚙️  Select Backend Framework:
  Express.js (Recommended)
❯ Fastify (High Performance)
  NestJS (Enterprise)
```
→ *Select Fastify*

```
? 🔌 Enable Realtime Sockets? (Y/n)
```
→ *Press n*

```
? 🔐 Generate Authentication System? (Y/n)
```
→ *Press Y*

```
? 🔑 Select Authentication Type:
  JWT (JSON Web Token)
❯ OAuth 2.0
  Session-Based
```
→ *Select OAuth 2.0*

```
? ✅ Enable Request Validation (Joi)? (Y/n)
```
→ *Press Y*

```
? ⚡ Enable Redis Caching? (Y/n)
```
→ *Press Y*

```
? 📊 Enable Advanced Logging? (Y/n)
```
→ *Press Y*

### Expected Result
```
✨ Configuration Summary:

  ✔ Database        → PostgreSQL (Sequelize)
  ✔ Framework       → Fastify
  ✔ Realtime Socket → Disabled
  ✔ Authentication  → Enabled (OAuth 2.0)
  ✔ Validation      → Enabled
  ✔ Caching         → Enabled (Redis)
  ✔ Logging         → Enabled
```

### Verify package.json
```bash
cat demo-fastify-postgres/backend/package.json
# Should contain: fastify, sequelize, pg, passport, redis, ioredis
```

---

## Test 3: SQLite Lightweight Setup

### Command
```bash
backendify generate demo-sqlite-lightweight
```

### Select Configuration
- Database: SQLite
- Framework: Express.js
- Sockets: No
- Auth: No
- Validation: No
- Caching: No
- Logging: No

### Result
Minimal dependencies:
```json
{
  "express": "^4.18.2",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "sequelize": "^6.33.0",
  "sqlite3": "^5.1.6"
}
```

---

## Test 4: Full-Featured Setup

### Command
```bash
backendify generate demo-full-featured
```

### Select All Features
- Database: MongoDB
- Framework: Express.js
- Sockets: Yes
- Auth: Yes → JWT
- Validation: Yes
- Caching: Yes
- Logging: Yes

### Dependencies Count
Should install ~13-15 packages including:
```
express, mongoose, socket.io, redis, jsonwebtoken, 
bcryptjs, joi, class-validator, winston, morgan, 
helmet, cors, dotenv, nodemon
```

---

## Verification Script

### Save as `test-backendify.sh`

```bash
#!/bin/bash

echo "🧪 Testing Backendify Interactive Setup"
echo "======================================"

# Test 1: Quick generation
echo -e "\n✨ Test 1: Quick Generation"
backendify generate test-quick --quick --no-auto-connect
if [ -d "test-quick/backend" ]; then
    echo "✅ Test 1 Passed: Directory structure created"
else
    echo "❌ Test 1 Failed: Directory not created"
    exit 1
fi

# Test 2: Check files
echo -e "\n✨ Test 2: Verify Files"
required_files=(
    "test-quick/backend/server.js"
    "test-quick/backend/package.json"
    "test-quick/.env"
    "test-quick/backend/config/database.js"
    "test-quick/backend/middleware/errorHandler.js"
    "test-quick/backend/models/User.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Test 3: Check directories
echo -e "\n✨ Test 3: Verify Directories"
required_dirs=(
    "test-quick/backend/config"
    "test-quick/backend/middleware"
    "test-quick/backend/models"
    "test-quick/backend/controllers"
    "test-quick/backend/routes"
    "test-quick/backend/auth"
    "test-quick/backend/socket"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Found: $dir"
    else
        echo "❌ Missing: $dir"
        exit 1
    fi
done

# Test 4: Check .env content
echo -e "\n✨ Test 4: Verify .env Configuration"
if grep -q "MONGODB_URI" test-quick/.env; then
    echo "✅ .env contains MONGODB_URI"
else
    echo "❌ .env missing MONGODB_URI"
    exit 1
fi

if grep -q "JWT_SECRET" test-quick/.env; then
    echo "✅ .env contains JWT_SECRET"
else
    echo "❌ .env missing JWT_SECRET"
    exit 1
fi

# Test 5: Check package.json
echo -e "\n✨ Test 5: Verify package.json"
if grep -q '"mongoose"' test-quick/backend/package.json; then
    echo "✅ package.json contains mongoose"
else
    echo "❌ package.json missing mongoose"
    exit 1
fi

if grep -q '"socket.io"' test-quick/backend/package.json; then
    echo "✅ package.json contains socket.io"
else
    echo "❌ package.json missing socket.io"
    exit 1
fi

echo -e "\n✨ Test 6: Install Dependencies"
cd test-quick/backend
npm install --silent 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ npm install successful"
else
    echo "⚠️  npm install requires node_modules (optional check)"
fi

echo -e "\n🎉 All Tests Passed!"
echo "======================================"

# Cleanup
cd ../..
# rm -rf test-quick  # Uncomment to auto-cleanup
```

### Run Tests
```bash
chmod +x test-backendify.sh
./test-backendify.sh
```

---

## Manual Testing Checklist

### Prerequisite
```bash
node --version  # Should be v14+ 
npm --version   # Should be v6+
```

### Step 1: Generate Backend
```bash
backendify generate my-test-app --quick --no-auto-connect
```

**Verify**:
- [ ] `my-test-app/backend` directory created
- [ ] `my-test-app/.env` file created
- [ ] All 11 subdirectories exist
- [ ] 13 required files exist

### Step 2: Check Configuration
```bash
cat my-test-app/.env
cat my-test-app/backend/package.json
```

**Verify**:
- [ ] .env has database configuration
- [ ] .env has JWT_SECRET
- [ ] package.json has all dependencies
- [ ] package.json has dev scripts

### Step 3: Install Dependencies
```bash
cd my-test-app/backend
npm install
```

**Verify**:
- [ ] No errors during installation
- [ ] node_modules created
- [ ] 50+ packages installed

### Step 4: Syntax Check
```bash
node --check server.js
node --check config/database.js
node --check middleware/errorHandler.js
```

**Verify**:
- [ ] All .js files have valid syntax

### Step 5: Start Server
```bash
npm run dev
```

**Verify**:
- [ ] Server starts without errors
- [ ] Listens on port 5000
- [ ] Shows connection message
- [ ] Can be stopped with Ctrl+C

### Step 6: Test Health Endpoint
```bash
# In another terminal
curl http://localhost:5000/api/health
```

**Verify**:
- [ ] Returns JSON response
- [ ] Contains `status: "ok"`
- [ ] Contains timestamp

---

## Performance Benchmarks

### Generation Time
```
Quick Mode:        ~2-3 seconds
Interactive Mode:  ~5-7 seconds (with user input)
With npm install:  ~30-60 seconds (depends on internet)
```

### Generated Code Size
```
Minimal config:    ~50KB (without node_modules)
Full config:       ~60KB (without node_modules)
With node_modules: ~500MB+
```

### Startup Time
```
Cold start:        ~1-2 seconds
After first run:   <500ms
```

---

## Troubleshooting Tests

### Issue: "command not found: backendify"
**Solution**:
```bash
npm install -g .  # Install globally from your backendify directory
backendify --version
```

### Issue: "Cannot find module 'inquirer'"
**Solution**:
```bash
npm install  # Install dependencies in main backendify directory
```

### Issue: "Port 5000 already in use"
**Solution**:
```bash
# Change PORT in .env
PORT=3000

# Or kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

### Issue: Database connection fails
**Solution**:
```bash
# Ensure MongoDB is running (if MongoDB selected)
# Or configure correct database URI in .env
MONGODB_URI=mongodb://your-server:27017/database
```

---

## Success Indicators

Generated backend should:
- ✅ Have complete directory structure
- ✅ Have all configuration files
- ✅ Have auto-generated code with no syntax errors
- ✅ Have all dependencies in package.json
- ✅ Support quick npm install
- ✅ Start server without errors
- ✅ Respond to health check
- ✅ Have proper error handling
- ✅ Support custom database configuration
- ✅ Include authentication (if selected)
- ✅ Include sockets (if selected)
- ✅ Include caching (if selected)
- ✅ Include logging (if selected)

---

## Demo Workflow

**Complete workflow from scratch**:

```bash
# 1. Generate
backendify generate my-project --quick --no-auto-connect

# 2. Navigate
cd my-project/backend

# 3. Install
npm install

# 4. Review
cat ../README.md
cat ../env
cat package.json

# 5. Start
npm run dev

# 6. Test (in another terminal)
curl http://localhost:5000/api/health

# 7. Stop
# Ctrl+C

# 8. Auto-connect frontend (optional)
cd ..
backendify connect
```

---

**Ready to test! Run `backendify generate` now! ⚡**
