/**
 * Timeout Configuration
 * Centralized configuration for all timeouts in the application
 */

const isDev = process.env.NODE_ENV === 'development';

// Convert seconds to milliseconds
const seconds = (s) => s * 1000;

const timeoutConfig = {
  // HTTP Request timeout (Express level)
  // How long a client request can take
  http: {
    // Default timeout for all routes
    default: seconds(isDev ? 60 : 30),
    
    // Specific route timeouts
    routes: {
      // Longer timeouts for expensive operations
      analytics: seconds(60),
      transcripts: seconds(45),
      'result-slip': seconds(45),
      archives: seconds(60),
      dtef: seconds(30),
      
      // Standard timeouts
      default: seconds(30),
    },
  },
  
  // External API timeouts (Axios)
  external: {
    // Default for all external calls
    default: seconds(10),
    
    // Specific service timeouts
    services: {
      dtef: seconds(30), // DTEF API can be slow
      email: seconds(15),
      sms: seconds(10),
      default: seconds(10),
    },
  },
  
  // Database operation timeouts (PocketBase)
  database: {
    // Default for all DB operations
    default: seconds(10),
    
    // Specific operation timeouts
    operations: {
      query: seconds(5),
      insert: seconds(10),
      update: seconds(10),
      delete: seconds(5),
      bulk: seconds(30), // Bulk operations
      complex: seconds(15), // Complex queries
      default: seconds(10),
    },
  },
  
  // Graceful shutdown timeout
  shutdown: seconds(30),
};

module.exports = timeoutConfig;
