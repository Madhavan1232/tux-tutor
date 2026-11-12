const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const passport = require('./src/config/passport');
const prisma = require('./db');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const dashboardRouter = require('./routes/dashboard/dashboardRouter');
const missionRouter = require('./routes/mission/missionRouter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Cross-Origin Isolation & Security Headers (Required by CheerpX SharedArrayBuffer)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Basic health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Tux Tutor API & Database are healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Authentication Routes (supports both /auth and /api/auth)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// User Profile Routes
app.use('/api/user', userRoutes);

// Dashboard Routes
app.use('/api/dashboard', dashboardRouter);

// Mission Workspace Routes
app.use('/api/missions', missionRouter);

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred.',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
