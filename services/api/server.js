import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB, getDBStatus, disconnectDB } from './src/config/db.js';
import { initializeSocketServer } from './src/socket/socketServer.js';
import apiRoutes from './src/routes/index.js';
import { globalRateLimiter } from './src/middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for flexible API & Socket.IO transport
    crossOriginEmbedderPolicy: false
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global Rate Limiting
app.use('/api', globalRateLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'online',
    service: 'CITYMIND API Server',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    memory: {
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    }
  });
});

// API Routes Mounting
app.use('/api/v1', apiRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err.stack || err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Create HTTP Server
const httpServer = http.createServer(app);

// Mount Socket.IO Real-time Multiplayer Server
const io = initializeSocketServer(httpServer);

// Connect to Database and start listening
const startServer = async () => {
  try {
    console.log(`[CITYMIND API] Bootstrapping server in ${NODE_ENV} mode...`);
    
    // Connect to MongoDB
    await connectDB();

    // Start HTTP & WebSocket Listener
    httpServer.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CITYMIND API Server running on port ${PORT}`);
      console.log(`🌐 REST API: http://localhost:${PORT}/api/v1`);
      console.log(`⚡ WebSocket Server attached to http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[CITYMIND API] Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful Shutdown Handlers
const handleShutdown = async (signal) => {
  console.log(`\n[CITYMIND API] Received ${signal}. Initiating graceful shutdown...`);
  
  if (io) {
    io.close(() => {
      console.log('[Socket.IO] Realtime server closed.');
    });
  }

  httpServer.close(async () => {
    console.log('[HTTP Server] Stopped accepting new connections.');
    await disconnectDB();
    console.log('[CITYMIND API] Shutdown sequence completed cleanly.');
    process.exit(0);
  });

  // Force exit if shutdown hangs
  setTimeout(() => {
    console.error('[CITYMIND API] Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception] thrown:', err);
});

startServer();

export { app, httpServer, io };
