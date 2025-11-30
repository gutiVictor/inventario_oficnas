/**
 * Utility functions for consistent API responses
 */

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

const sendCreated = (res, data) => {
  res.status(201).json({
    success: true,
    data
  });
};

const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

const sendNotFound = (res, resource = 'Resource') => {
  res.status(404).json({
    success: false,
    error: `${resource} not found`
  });
};

const sendPaginated = (res, data, page, limit, total) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendPaginated
};
