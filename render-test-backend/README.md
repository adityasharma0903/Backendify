# Render Test Backend

Minimal Express backend for testing deployment on Render.

## Local Run

```bash
cd render-test-backend
npm install
npm start
```

App runs at `http://localhost:5000` (or `PORT` env).

## Endpoints

- `GET /`
- `GET /health`
- `GET /api/ping`

## Deploy on Render (Web Service)

Use these settings in Render dashboard:

- Root Directory: `render-test-backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `Node`

After deploy, verify:

- `https://<your-service>.onrender.com/health`
- `https://<your-service>.onrender.com/api/ping`
