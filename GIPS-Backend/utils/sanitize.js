/**
 * Input Sanitization Utility
 * Provides functions for sanitizing user inputs to prevent XSS attacks
 * Uses xss library for HTML sanitization
 */

const xss = require('xss');

/**
 * Sanitize a string value
 * @param {string} value - The value to sanitize
 * @returns {string} - Sanitized value
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Use xss library to sanitize HTML/script tags
  return xss(value, {
    whiteList: {}, // Empty whitelist = remove all HTML tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  });
};

/**
 * Recursively sanitize an object
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  // Return primitives as-is
  return obj;
};

/**
 * Middleware to sanitize request body, query, and params
 * This is a more thorough sanitization than xss-clean
 * @param {Object} options - Options for sanitization
 * @returns {Function} - Express middleware
 */
const sanitizeRequest = (options = {}) => {
  const { body = true, query = true, params = true } = options;
  
  return (req, res, next) => {
    if (body && req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (query && req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    if (params && req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  };
};

/**
 * Sanitize specific fields in an object
 * Useful for sanitizing specific database fields before saving
 * @param {Object} data - The data object
 * @param {string[]} fields - Array of field names to sanitize
 * @returns {Object} - Object with sanitized fields
 */
const sanitizeFields = (data, fields) => {
  const sanitized = { ...data };
  
  for (const field of fields) {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      if (typeof sanitized[field] === 'string') {
        sanitized[field] = sanitizeString(sanitized[field]);
      } else if (Array.isArray(sanitized[field])) {
        sanitized[field] = sanitized[field].map(item => 
          typeof item === 'string' ? sanitizeString(item) : item
        );
      }
    }
  }
  
  return sanitized;
};

/**
 * Escape special regex characters in a string
 * Useful when building regex patterns from user input
 * @param {string} string - The string to escape
 * @returns {string} - Escaped string
 */
const escapeRegex = (string) => {
  if (typeof string !== 'string') {
    return string;
  }
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitize a filename to prevent directory traversal
 * @param {string} filename - The filename to sanitize
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') {
    return filename;
  }
  
  // Remove path traversal attempts
  return filename
    .replace(/\\/g, '/') // Normalize backslashes
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\/+/, '/'); // Normalize multiple slashes
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeRequest,
  sanitizeFields,
  escapeRegex,
  sanitizeFilename,
};
