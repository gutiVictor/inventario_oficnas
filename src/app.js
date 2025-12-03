const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Logging Middleware
app.use(morgan('dev'));

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory API is running',
    version: '1.0.0',
    endpoints: {
      assets: '/api/assets',
      users: '/api/users',
      locations: '/api/locations',
      categories: '/api/categories',
      suppliers: '/api/suppliers',
      maintenance: '/api/maintenance-orders',
      assignments: '/api/asset-assignments',
      moves: '/api/asset-moves',
      audit: '/api/audit-logs',
      export: '/api/export'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/assets', require('./routes/assets.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/locations', require('./routes/locations.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/suppliers', require('./routes/suppliers.routes'));
app.use('/api/maintenance-orders', require('./routes/maintenance.routes'));
app.use('/api/asset-assignments', require('./routes/assignments.routes'));
app.use('/api/asset-moves', require('./routes/moves.routes'));
app.use('/api/audit-logs', require('./routes/audit.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/export', require('./routes/export.routes'));

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Error Handler - must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
