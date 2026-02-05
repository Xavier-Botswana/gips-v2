/**
 * Rate Limiting Middleware
 * Provides tiered rate limiting for different endpoint categories
 */

const rateLimit = require('express-rate-limit');
const { rateLimits } = require('../config/rateLimits');

const isDev = process.env.NODE_ENV === 'development';

// Store for tracking authenticated user requests separately
const authenticatedRequests = new Map();

/**
 * Custom handler for rate limit exceeded
 * Logs the event and returns standardized error response
 */
const handleLimitReached = (req, res, options) => {
  const clientId = req.user?.id || req.ip;
  const endpoint = req.originalUrl || req.url;
  
  // Log rate limit exceeded (in production, send to monitoring)
  if (!isDev) {
    console.warn(`[Rate Limit] Limit exceeded for ${clientId} on ${endpoint}`);
  }
  
  res.status(429).json(options.message);
};

/**
 * Create rate limiter with custom handler
 */
const createLimiter = (config) => {
  return rateLimit({
    ...config,
    handler: handleLimitReached,
    // Custom key generator that considers authentication
    keyGenerator: (req) => {
      // If user is authenticated, use user ID + IP to prevent account sharing
      if (req.user?.id) {
        return `${req.user.id}:${req.ip}`;
      }
      // Otherwise use just IP
      return req.ip;
    },
  });
};

// Global rate limiter - applied to all routes
const globalLimiter = createLimiter(rateLimits.global);

// Authentication rate limiter - strict limits for login attempts
const authLimiter = createLimiter(rateLimits.auth);

// Password reset rate limiter - very strict
const passwordResetLimiter = createLimiter(rateLimits.passwordReset);

// Registration rate limiter - prevent spam accounts
const registrationLimiter = createLimiter(rateLimits.registration);

// Application submission rate limiter
const applicationLimiter = createLimiter(rateLimits.application);

// Email rate limiter
const emailLimiter = createLimiter(rateLimits.email);

// Expensive operation rate limiter
const expensiveLimiter = createLimiter(rateLimits.expensive);

// Health check rate limiter - very lenient
const healthLimiter = createLimiter(rateLimits.health);

/**
 * Skip rate limiting for certain conditions
 * - Whitelisted IPs
 * - Internal service calls
 * - Health checks from monitoring services
 */
const skipRateLimit = (req) => {
  // Skip for whitelisted IPs (monitoring services)
  const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
  if (whitelistedIPs.includes(req.ip)) {
    return true;
  }
  
  // Skip for health checks with valid monitoring token
  if (req.path === '/health' && req.headers['x-monitoring-token'] === process.env.MONITORING_TOKEN) {
    return true;
  }
  
  return false;
};

/**
 * Middleware to conditionally skip rate limiting
 */
const conditionalRateLimit = (limiter) => {
  return (req, res, next) => {
    if (skipRateLimit(req)) {
      return next();
    }
    return limiter(req, res, next);
  };
};

/**
 * Dynamic rate limiter based on user role
 * Gives higher limits to authenticated users
 */
const dynamicLimiter = (baseConfig) => {
  return rateLimit({
    ...baseConfig,
    max: (req) => {
      // Base limit for anonymous users
      let limit = baseConfig.max;
      
      // Boost for authenticated users
      if (req.user) {
        switch (req.user.role) {
          case 'superAdmin':
          case 'admin':
            limit *= 5; // 5x limit for admins
            break;
          case 'lecturer':
          case 'hod':
            limit *= 3; // 3x limit for staff
            break;
          case 'student':
            limit *= 2; // 2x limit for students
            break;
          default:
            limit *= 1.5; // 1.5x for other authenticated users
        }
      }
      
      return limit;
    },
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `${req.user.id}:${req.ip}`;
      }
      return req.ip;
    },
    handler: handleLimitReached,
  });
};

// Export all limiters
module.exports = {
  // Basic limiters
  globalLimiter: conditionalRateLimit(globalLimiter),
  authLimiter: conditionalRateLimit(authLimiter),
  passwordResetLimiter: conditionalRateLimit(passwordResetLimiter),
  registrationLimiter: conditionalRateLimit(registrationLimiter),
  applicationLimiter: conditionalRateLimit(applicationLimiter),
  emailLimiter: conditionalRateLimit(emailLimiter),
  expensiveLimiter: conditionalRateLimit(expensiveLimiter),
  healthLimiter: conditionalRateLimit(healthLimiter),
  
  // Dynamic limiter
  dynamicLimiter,
  
  // Utility functions
  skipRateLimit,
  createLimiter,
  handleLimitReached,
};
