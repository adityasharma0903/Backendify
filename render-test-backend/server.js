const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Render test backend is running'
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/ping', (_req, res) => {
  res.status(200).json({
    success: true,
    data: 'pong'
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
