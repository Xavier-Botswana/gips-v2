/**
 * Database Operation Helpers with Proper Error Handling
 * Replaces silent error swallowing patterns with proper logging and error propagation
 */

const logger = require('./logger');
const AppError = require('./appError');

/**
 * Safely fetch a single record by ID with proper error handling
 * @param {Object} pb - PocketBase instance
 * @param {string} collection - Collection name
 * @param {string} id - Record ID
 * @param {Object} options - Additional options (expand, fields, etc.)
 * @returns {Promise<Object|null>} - Record or null if not found
 * @throws {AppError} - For database errors (not 404s)
 */
const safeGetOne = async (pb, collection, id, options = {}) => {
  try {
    return await pb.collection(collection).getOne(id, options);
  } catch (error) {
    if (error.status === 404 || error.response?.code === 404) {
      return null;
    }
    
    logger.error(`Database error fetching ${collection}/${id}`, {
      collection,
      id,
      error: error.message,
      stack: error.stack,
    });
    
    throw new AppError(`Failed to fetch ${collection}`, 500);
  }
};

/**
 * Safely fetch first matching record with proper error handling
 * @param {Object} pb - PocketBase instance
 * @param {string} collection - Collection name
 * @param {string} filter - Filter string
 * @param {Object} options - Additional options
 * @returns {Promise<Object|null>} - Record or null if not found
 * @throws {AppError} - For database errors (not 404s)
 */
const safeGetFirst = async (pb, collection, filter, options = {}) => {
  try {
    return await pb.collection(collection).getFirstListItem(filter, options);
  } catch (error) {
    if (error.status === 404 || error.response?.code === 404) {
      return null;
    }
    
    logger.error(`Database error fetching first ${collection}`, {
      collection,
      filter,
      error: error.message,
      stack: error.stack,
    });
    
    throw new AppError(`Failed to fetch ${collection}`, 500);
  }
};

/**
 * Wrap a DB operation with proper error handling for controllers
 * This replaces the `.catch(() => null)` pattern
 * @param {Function} operation - Async operation to wrap
 * @param {Object} context - Context for logging {operation, entity, details}
 * @param {boolean} allowNull - Whether to return null on 404 (default: true)
 * @returns {Promise<any>} - Operation result
 */
const withDbErrorHandling = async (operation, context, allowNull = true) => {
  try {
    return await operation();
  } catch (error) {
    // Log the error with context
    logger.error(`Database operation failed: ${context.operation}`, {
      operation: context.operation,
      entity: context.entity,
      details: context.details,
      error: error.message,
      stack: error.stack,
    });
    
    // If it's a 404 and we allow null, return null
    if (allowNull && (error.status === 404 || error.response?.code === 404)) {
      return null;
    }
    
    // Re-throw for proper error handling upstream
    throw error;
  }
};

module.exports = {
  safeGetOne,
  safeGetFirst,
  withDbErrorHandling,
};
