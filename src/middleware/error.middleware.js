/**
 * Centralized error handling middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    const field = err.detail?.match(/Key \((.*?)\)/)?.[1] || 'field';
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: `A record with this ${field} already exists`,
      field
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    const field = err.detail?.match(/Key \((.*?)\)/)?.[1] || 'reference';
    return res.status(400).json({
      success: false,
      error: 'Invalid reference',
      message: `The referenced ${field} does not exist`,
      field
    });
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    return res.status(400).json({
      success: false,
      error: 'Missing required field',
      message: `Field '${err.column}' is required`,
      field: err.column
    });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Data does not meet validation constraints',
      constraint: err.constraint
    });
  }

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: err.errors
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
};

module.exports = { errorHandler, notFoundHandler };
