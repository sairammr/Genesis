const express = require('express');
const cors = require('cors');
const sceneRoutes = require('./routes/sceneCreation');

// Create Express app
const app = express();

// Configure port
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Preflight request handler for all routes
app.options('*', cors(corsOptions));

// Register routes directly without '/api' prefix
app.use(sceneRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Start the server
function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS is enabled for all origins`);
  });

  // Global unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  return server;
}

// Start the server immediately when the file is run
startServer();

// Export for potential testing or advanced usage
module.exports = {
  app,
  startServer
};