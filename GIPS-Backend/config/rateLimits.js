/**
 * Rate Limiting Configuration
 * Centralized configuration for all rate limiters
 * Environment-specific overrides supported
 */

const isDev = process.env.NODE_ENV === 'development';

// Helper to create time values in milliseconds
const time = {
  seconds: (n) => n * 1000,
  minutes: (n) => n * 60 * 1000,
  hours: (n) => n * 60 * 60 * 1000,
};

const rateLimits = {
  // Global rate limit - applied to all routes
  // More lenient in development
  global: {
    windowMs: time.minutes(15),
    max: isDev ? 1000 : 100,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  },

  // Authentication endpoints - strict limits to prevent brute force
  auth: {
    windowMs: time.minutes(15),
    max: 5,
    skipSuccessfulRequests: true, // Don't count successful logins against the limit
    message: {
      status: 'error',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Password reset - very strict to prevent abuse
  passwordReset: {
    windowMs: time.hours(1),
    max: 3,
    message: {
      status: 'error',
      message: 'Too many password reset requests. Please try again after 1 hour.',
      code: 'RESET_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Account creation - prevent spam registrations
  registration: {
    windowMs: time.hours(1),
    max: 5,
    message: {
      status: 'error',
      message: 'Too many account creation attempts. Please try again later.',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Application submissions - prevent spam applications
  application: {
    windowMs: time.hours(1),
    max: 10,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    },
    message: {
      status: 'error',
      message: 'Too many application submissions. Please try again later.',
      code: 'APPLICATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Email sending - prevent email spam
  email: {
    windowMs: time.hours(1),
    max: 20,
    message: {
      status: 'error',
      message: 'Too many email requests. Please try again later.',
      code: 'EMAIL_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // API endpoints that are expensive (analytics, reports)
  expensive: {
    windowMs: time.minutes(5),
    max: 10,
    message: {
      status: 'error',
      message: 'Too many requests to this endpoint. Please try again later.',
      code: 'EXPENSIVE_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Health check - very lenient
  health: {
    windowMs: time.minutes(1),
    max: 60,
    message: {
      status: 'error',
      message: 'Too many health check requests.',
      code: 'HEALTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
};

// Routes configuration - maps route patterns to rate limit types
const routeConfig = {
  // Authentication routes
  authRoutes: [
    { path: '/v1/users/login', method: 'POST' },
  ],

  // Password reset routes
  passwordResetRoutes: [
    { path: '/v1/users/request-password-reset', method: 'POST' },
    { path: '/v1/users/confirm-password-reset', method: 'POST' },
  ],

  // Registration routes
  registrationRoutes: [
    { path: '/v1/users', method: 'POST' },
  ],

  // Application routes
  applicationRoutes: [
    { path: '/v1/applications', method: 'POST' },
  ],

  // Email routes
  emailRoutes: [
    { path: '/v1/emails', method: 'POST' },
    { path: '/v1/emails/send', method: 'POST' },
  ],

  // Expensive operation routes
  expensiveRoutes: [
    { path: '/v1/analytics', method: 'GET' },
    { path: '/v1/transcripts', method: 'POST' },
    { path: '/v1/result-slip', method: 'POST' },
    { path: '/v1/archives', method: 'POST' },
  ],

  // Health check routes
  healthRoutes: [
    { path: '/health', method: 'GET' },
    { path: '/v1/health', method: 'GET' },
  ],
};

module.exports = {
  rateLimits,
  routeConfig,
  time,
};
