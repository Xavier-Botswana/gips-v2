/**
 * Database Health Check Utility
 * Validates PocketBase connection and provides health status
 */

const pb = require('./dbBase');
const appLogger = require('./appLogger');

/**
 * Check if PocketBase is reachable and responding
 * @returns {Promise<Object>} - Health check result
 */
const checkDatabaseConnection = async () => {
  const startTime = Date.now();
  
  try {
    // Try to get the health endpoint or a lightweight collection list
    // Using health check endpoint if available, otherwise get list of collections
    const health = await pb.health.check();
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      connected: true,
      responseTime: `${responseTime}ms`,
      message: 'Database connection established',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'unhealthy',
      connected: false,
      responseTime: `${responseTime}ms`,
      message: 'Database connection failed',
      error: error.message,
      code: error.status || error.code || 'UNKNOWN',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Validate database connection on startup
 * Exits process if connection fails
 * @returns {Promise<boolean>} - True if connected, exits if failed
 */
const validateDatabaseOnStartup = async () => {
  appLogger.info('Validating database connection...');
  
  const result = await checkDatabaseConnection();
  
  if (!result.connected) {
    appLogger.error('Database connection failed!', { error: result.error });
    appLogger.error('Please check:');
    appLogger.error('1. Is PocketBase running?');
    appLogger.error(`2. Is DB_URL correct? (Current: ${process.env.DB_URL || 'not set'})`);
    appLogger.error('3. Network connectivity to database');
    appLogger.error('4. Firewall rules allowing connection');
    appLogger.error('Server will not start until database is available.');
    
    // Exit with error code for container orchestration
    process.exit(1);
  }
  
  appLogger.info(`Database connection validated (${result.responseTime})`);
  return true;
};

/**
 * Get detailed database health information
 * @returns {Promise<Object>} - Detailed health info
 */
const getDatabaseHealth = async () => {
  const connectionCheck = await checkDatabaseConnection();
  
  if (!connectionCheck.connected) {
    return {
      ...connectionCheck,
      collections: null,
      version: null,
    };
  }
  
  try {
    // Get additional info if connected
    const [collections, settings] = await Promise.all([
      pb.collections.getFullList().catch((error) => {
        appLogger.warn('Failed to load collections list for health check', {
          error: error.message,
        });
        return [];
      }),
      pb.settings.getAll().catch((error) => {
        appLogger.warn('Failed to load settings for health check', {
          error: error.message,
        });
        return null;
      }),
    ]);
    
    return {
      ...connectionCheck,
      collections: {
        count: collections.length,
        names: collections.slice(0, 10).map(c => c.name), // First 10 only
      },
      version: settings?.meta?.appName || 'unknown',
      serverInfo: {
        url: process.env.DB_URL,
        masked: process.env.DB_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
      },
    };
  } catch (error) {
    return {
      ...connectionCheck,
      collections: null,
      version: null,
      detailsError: error.message,
    };
  }
};

/**
 * Wait for database to become available (with timeout)
 * Useful for Docker Compose startup order
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} delayMs - Delay between attempts in ms
 * @returns {Promise<boolean>} - True if connected
 */
const waitForDatabase = async (maxAttempts = 30, delayMs = 2000) => {
  appLogger.info(`Waiting for database (max ${maxAttempts} attempts)...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await checkDatabaseConnection();
    
    if (result.connected) {
      appLogger.info(`Database available after ${attempt} attempt(s)`);
      return true;
    }
    
    if (attempt < maxAttempts) {
      appLogger.warn(`Attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  appLogger.error(`Database not available after ${maxAttempts} attempts`);
  return false;
};

module.exports = {
  checkDatabaseConnection,
  validateDatabaseOnStartup,
  getDatabaseHealth,
  waitForDatabase,
};
