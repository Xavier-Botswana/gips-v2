/**
 * Timeout Middleware and Utilities
 * Handles request timeouts for Express, Axios, and Database operations
 */

const timeout = require('connect-timeout');
const timeoutConfig = require('../config/timeouts');
const HTTP_STATUS = require('../utils/httpStatus');


/**
 * Create timeout middleware for Express routes
 * @param {number} duration - Timeout duration in milliseconds
 * @returns {Function} - Express middleware
 */
const createTimeoutMiddleware = (duration = timeoutConfig.http.default) => {
  return timeout(duration, {
    respond: true,
    message: 'Request timeout - operation took too long',
  });
};

/**
 * Timeout middleware for specific routes
 * Usage: app.use('/route', routeTimeout('routeName'))
 */
const routeTimeout = (routeName) => {
  const duration = timeoutConfig.http.routes[routeName] || timeoutConfig.http.default;
  return createTimeoutMiddleware(duration);
};

/**
 * Global timeout middleware
 * Applied to all routes
 */
const globalTimeout = createTimeoutMiddleware(timeoutConfig.http.default);

/**
 * Middleware to handle timeout errors
 * Must be applied after all routes
 */
const handleTimeout = (err, req, res, next) => {
  if (req.timedout) {
    return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      status: 'error',
      message: 'Request timeout - the server took too long to respond',
      code: 'REQUEST_TIMEOUT',
      suggestion: 'Please try again later or contact support if the issue persists',
    });
  }
  next(err);
};

/**
 * Add timeout to a promise-based operation
 * @param {Promise} promise - The promise to add timeout to
 * @param {number} ms - Timeout in milliseconds
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} - Promise with timeout
 */
const withTimeout = (promise, ms, errorMessage = 'Operation timed out') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), ms)
    ),
  ]);
};

/**
 * Wrap an async function with timeout
 * @param {Function} fn - Async function to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} errorMessage - Custom error message
 * @returns {Function} - Wrapped function
 */
const wrapWithTimeout = (fn, ms, errorMessage) => {
  return async (...args) => {
    return withTimeout(fn(...args), ms, errorMessage);
  };
};

/**
 * Axios request config with timeout
 * @param {string} service - Service name (for specific timeout values)
 * @param {Object} additionalConfig - Additional axios config
 * @returns {Object} - Axios config with timeout
 */
const axiosConfig = (service = 'default', additionalConfig = {}) => {
  const timeout = timeoutConfig.external.services[service] || timeoutConfig.external.default;
  
  return {
    timeout,
    ...additionalConfig,
  };
};

/**
 * Database operation timeout config
 * @param {string} operation - Operation type (query, insert, update, delete, bulk, complex)
 * @returns {number} - Timeout in milliseconds
 */
const dbTimeout = (operation = 'default') => {
  return timeoutConfig.database.operations[operation] || timeoutConfig.database.default;
};

/**
 * Halt execution on timeout
 * Stops processing after timeout is reached
 */
const haltOnTimeout = (req, res, next) => {
  if (!req.timedout) {
    next();
  }
};

module.exports = {
  // Middleware
  createTimeoutMiddleware,
  routeTimeout,
  globalTimeout,
  handleTimeout,
  haltOnTimeout,
  
  // Utilities
  withTimeout,
  wrapWithTimeout,
  axiosConfig,
  dbTimeout,
  
  // Config
  timeoutConfig,
};
